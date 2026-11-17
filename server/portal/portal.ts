import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  randomUUID,
} from 'node:crypto';
import type { ApiRequest } from './http.js';
import { getCookie, HttpError } from './http.js';

const SESSION_COOKIE = 'portal_session';
const SESSION_TTL_SECONDS = 12 * 60 * 60;

export interface PortalSession {
  role: 'client' | 'admin' | 'staff';
  sub: string;
  exp: number;
}

export type AdminPermission =
  | 'project_read'
  | 'manage_updates'
  | 'delete_updates'
  | 'delete_projects'
  | 'process_resets'
  | 'manage_client_access'
  | 'feedback_manage'
  | 'manage_billing'
  | 'manage_change_orders';

const STAFF_PERMISSIONS = new Set<AdminPermission>([
  'project_read',
  'manage_updates',
  'process_resets',
  'feedback_manage',
]);

export interface ProjectRecord {
  id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  project_type: string | null;
  client_phone: string;
  location: string;
  status: string;
  progress_percent: number;
  start_date: string | null;
}

interface SupabaseError {
  message?: string;
}

export interface PortalAttachment {
  path: string;
  name: string;
  contentType: string;
  size: number;
}

const STORAGE_BUCKET = 'portal-progress';

export function createPasswordHash(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSession(role: PortalSession['role'], subject: string): string {
  const payload = Buffer.from(JSON.stringify({
    role,
    sub: subject,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function getSession(request: ApiRequest): PortalSession {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) throw new HttpError(401, 'Sesi telah berakhir. Silakan masuk kembali.');

  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) {
    throw new HttpError(401, 'Sesi tidak valid. Silakan masuk kembali.');
  }

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new HttpError(401, 'Sesi tidak valid. Silakan masuk kembali.');
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PortalSession;
    if (
      (session.role !== 'client' && session.role !== 'admin' && session.role !== 'staff') ||
      typeof session.sub !== 'string' ||
      !Number.isInteger(session.exp) ||
      session.exp <= Math.floor(Date.now() / 1000)
    ) {
      throw new Error('Invalid session claims');
    }
    return session;
  } catch {
    throw new HttpError(401, 'Sesi tidak valid. Silakan masuk kembali.');
  }
}

export function requireRole(session: PortalSession, role: PortalSession['role']): void {
  if (session.role !== role) {
    throw new HttpError(403, 'Anda tidak memiliki akses ke fitur ini.');
  }
}

export function requireAdminPermission(session: PortalSession, permission: AdminPermission): void {
  if (session.role === 'admin') return;
  if (session.role !== 'staff' || !STAFF_PERMISSIONS.has(permission)) {
    throw new HttpError(403, 'Anda tidak memiliki akses ke fitur ini.');
  }
}

export async function supabaseRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new HttpError(503, 'Portal belum dikonfigurasi. Hubungi administrator studio.');
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    await response.text();
    console.error('Supabase request failed with status:', response.status);
    if (response.status === 409) {
      throw new HttpError(409, 'ID proyek tersebut sudah digunakan.');
    }
    if (response.status === 404 && path.split('?')[0] === 'portal_payment_settings') {
      throw new HttpError(503, 'Pengaturan rekening belum tersedia. Jalankan pembaruan supabase/schema.sql di Supabase.');
    }
    throw new HttpError(502, 'Data portal tidak dapat dimuat. Silakan coba kembali.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function createStorageUploadUrl(path: string): Promise<string> {
  const result = await storageRequest<{ url?: string; signedURL?: string }>(
    `object/upload/sign/${STORAGE_BUCKET}/${encodeStoragePath(path)}`,
    { method: 'POST', body: '{}' }
  );
  return absoluteStorageUrl(result.signedURL ?? result.url);
}

export async function createStorageDownloadUrl(path: string, download: string | boolean = false): Promise<string> {
  const result = await storageRequest<{ signedURL?: string; url?: string }>(
    `object/sign/${STORAGE_BUCKET}/${encodeStoragePath(path)}`,
    { method: 'POST', body: JSON.stringify({ expiresIn: 3600 }) }
  );
  const signedUrl = new URL(absoluteStorageUrl(result.signedURL ?? result.url));
  if (download) signedUrl.searchParams.set('download', download === true ? '' : download);
  return signedUrl.toString();
}

export async function deleteStorageObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await storageRequest<unknown>(`object/${STORAGE_BUCKET}`, {
    method: 'DELETE',
    body: JSON.stringify({ prefixes: paths }),
  });
}

export function isStoredAttachmentPath(path: unknown, projectId: string): path is string {
  const prefix = `${projectId}/`;
  return typeof path === 'string' &&
    path.startsWith(prefix) &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|pdf|doc|docx|xlsx|txt|csv)$/i.test(path.slice(prefix.length));
}

export function createStorageObjectPath(projectId: string, extension: string): string {
  return `${projectId}/${randomUUID()}.${extension}`;
}

async function storageRequest<T>(path: string, init: RequestInit): Promise<T> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new HttpError(503, 'Portal belum dikonfigurasi. Hubungi administrator studio.');
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/storage/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!response.ok) {
    await response.text();
    console.error('Supabase Storage request failed with status:', response.status);
    throw new HttpError(502, 'File portal tidak dapat diproses. Pastikan bucket penyimpanan sudah disiapkan.');
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function encodeStoragePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

function absoluteStorageUrl(path: string | undefined): string {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl || !path) {
    throw new HttpError(502, 'URL file portal tidak valid.');
  }
  const baseUrl = supabaseUrl.replace(/\/$/, '');
  if (/^https?:\/\//i.test(path)) return path;
  const storagePath = path.startsWith('/storage/v1/')
    ? path
    : `/storage/v1/${path.replace(/^\/+/, '')}`;
  return new URL(storagePath, baseUrl).toString();
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  const projects = await supabaseRequest<ProjectRecord[]>(
    `client_projects?select=id,project_code,project_name,client_name,project_type,client_phone,location,status,progress_percent,start_date&id=eq.${encodeURIComponent(id)}&limit=1`
  );
  return projects[0] ?? null;
}

export async function requireProjectAccess(projectId: string, subject: string): Promise<void> {
  if (projectId === subject) return;
  const projects = await supabaseRequest<Array<{ id: string }>>(
    `client_projects?select=id&id=eq.${encodeURIComponent(projectId)}&client_email=eq.${encodeURIComponent(subject)}&limit=1`
  );
  if (!projects[0]) throw new HttpError(403, 'Anda tidak memiliki akses ke proyek ini.');
}

export function createAdminSession(email: string, password: string): 'admin' | 'staff' | null {
  const configuredEmail = process.env.PORTAL_ADMIN_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.PORTAL_ADMIN_PASSWORD;
  if (!configuredEmail || !isValidEmail(configuredEmail) || !configuredPassword || configuredPassword.length < 16) {
    throw new HttpError(503, 'Email dan password admin belum dikonfigurasi dengan aman.');
  }
  const staffEmail = process.env.PORTAL_STAFF_EMAIL?.trim().toLowerCase();
  const staffPassword = process.env.PORTAL_STAFF_PASSWORD;
  if (Boolean(staffEmail) !== Boolean(staffPassword)) {
    throw new HttpError(503, 'Email dan password staf harus dikonfigurasi bersama.');
  }
  if (
    staffEmail &&
    (!isValidEmail(staffEmail) || staffEmail === configuredEmail || !staffPassword || staffPassword.length < 16)
  ) {
    throw new HttpError(503, 'Akun staf belum dikonfigurasi dengan aman.');
  }

  const secret = sessionSecret();
  const actualEmail = createHmac('sha256', secret).update(email.trim().toLowerCase()).digest();
  const actualPassword = createHmac('sha256', secret).update(password).digest();
  const adminEmailMatches = timingSafeEqual(
    createHmac('sha256', secret).update(configuredEmail).digest(),
    actualEmail
  );
  const adminPasswordMatches = timingSafeEqual(
    createHmac('sha256', secret).update(configuredPassword).digest(),
    actualPassword
  );
  const staffEmailMatches = timingSafeEqual(
    createHmac('sha256', secret).update(staffEmail ?? '').digest(),
    actualEmail
  );
  const staffPasswordMatches = timingSafeEqual(
    createHmac('sha256', secret).update(staffPassword ?? '').digest(),
    actualPassword
  );

  if (adminEmailMatches && adminPasswordMatches) return 'admin';
  if (staffEmail && staffEmailMatches && staffPasswordMatches) return 'staff';
  return null;
}

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sign(payload: string): string {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function sessionSecret(): string {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new HttpError(503, 'Secret sesi portal belum dikonfigurasi dengan aman.');
  }
  return secret;
}
