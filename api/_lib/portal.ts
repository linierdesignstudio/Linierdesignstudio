import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import type { ApiRequest } from './http';
import { getCookie, HttpError } from './http';

const SESSION_COOKIE = 'portal_session';
const SESSION_TTL_SECONDS = 12 * 60 * 60;

export interface PortalSession {
  role: 'client' | 'admin';
  sub: string;
  exp: number;
}

export interface ProjectRecord {
  id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  location: string;
  status: string;
  progress_percent: number;
}

interface SupabaseError {
  message?: string;
}

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
      (session.role !== 'client' && session.role !== 'admin') ||
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
    throw new HttpError(502, 'Data portal tidak dapat dimuat. Silakan coba kembali.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  const projects = await supabaseRequest<ProjectRecord[]>(
    `client_projects?select=id,project_code,project_name,client_name,location,status,progress_percent&id=eq.${encodeURIComponent(id)}&limit=1`
  );
  return projects[0] ?? null;
}

export function createAdminSession(password: string): boolean {
  const configuredPassword = process.env.PORTAL_ADMIN_PASSWORD;
  if (!configuredPassword || configuredPassword.length < 16) {
    throw new HttpError(503, 'Password admin belum dikonfigurasi dengan aman.');
  }
  const expected = createHmac('sha256', sessionSecret()).update(configuredPassword).digest();
  const actual = createHmac('sha256', sessionSecret()).update(password).digest();
  return timingSafeEqual(expected, actual);
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
