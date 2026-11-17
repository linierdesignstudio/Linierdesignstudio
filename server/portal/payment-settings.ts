import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import {
  createStorageDownloadUrl,
  createStorageObjectPath,
  createStorageUploadUrl,
  deleteStorageObjects,
  getSession,
  requireAdminPermission,
  requireProjectAccess,
  requireRole,
  supabaseRequest,
  type PortalSession,
} from './portal.js';

interface PaymentSettingsRecord {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  bank_logo_path: string | null;
  updated_at: string;
}

interface PaymentSettingsResponse extends PaymentSettingsRecord {
  bank_logo_url: string | null;
}

interface LogoFile {
  contentType: string;
  size: number;
}

const SETTINGS_ID = 'global';
const SETTINGS_FIELDS = 'id,bank_name,account_number,account_holder,bank_logo_path,updated_at';
const LOGO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const LOGO_PATH_PATTERN = /^payment-settings\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = getSession(request);
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'GET') {
      await authorizeRead(session, url.searchParams.get('projectId') ?? '');
      sendJson(response, 200, { settings: await withLogoUrl(await getPaymentSettings()) });
      return;
    }

    if (request.method === 'POST') {
      requireAdminPermission(session, 'manage_billing');
      const body = await readJson(request);
      if (body.action !== 'start-logo-upload') {
        throw new HttpError(400, 'Tindakan pengunggahan logo tidak valid.');
      }
      const file = parseLogoFile(body.file);
      const path = createStorageObjectPath('payment-settings', LOGO_TYPES[file.contentType]);
      sendJson(response, 200, { path, uploadUrl: await createStorageUploadUrl(path) });
      return;
    }

    if (request.method === 'DELETE') {
      requireAdminPermission(session, 'manage_billing');
      const body = await readJson(request);
      const path = typeof body.path === 'string' ? body.path : '';
      if (!isPaymentLogoPath(path)) throw new HttpError(400, 'Lokasi logo bank tidak valid.');
      const settings = await getPaymentSettings();
      if (settings.bank_logo_path === path) throw new HttpError(409, 'Logo bank ini masih digunakan.');
      await deleteStorageObjects([path]);
      sendJson(response, 200, { deleted: true });
      return;
    }

    requireMethod(request, 'PUT');
    requireAdminPermission(session, 'manage_billing');
    const body = await readJson(request);
    const bankName = readText(body.bankName, 'Nama bank', 80);
    const accountNumber = readText(body.accountNumber, 'Nomor rekening', 64);
    const accountHolder = readText(body.accountHolder, 'Nama pemilik rekening', 120);
    const bankLogoPath = body.bankLogoPath === null
      ? null
      : typeof body.bankLogoPath === 'string' && isPaymentLogoPath(body.bankLogoPath)
        ? body.bankLogoPath
        : invalidLogoPath();

    const existing = await getPaymentSettings();
    const updated = await supabaseRequest<PaymentSettingsRecord[]>(
      `portal_payment_settings?id=eq.${SETTINGS_ID}&select=${SETTINGS_FIELDS}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          bank_name: bankName,
          account_number: accountNumber,
          account_holder: accountHolder,
          bank_logo_path: bankLogoPath,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    if (!updated[0]) throw new HttpError(502, 'Rekening bank tidak dapat disimpan.');

    let cleanupFailed = false;
    if (existing.bank_logo_path && existing.bank_logo_path !== bankLogoPath) {
      if (!isPaymentLogoPath(existing.bank_logo_path)) {
        console.error('Stored bank logo path is invalid; refusing to delete storage object.');
        cleanupFailed = true;
      } else {
        try {
          await deleteStorageObjects([existing.bank_logo_path]);
        } catch (error) {
          console.error('Previous bank logo cleanup failed after saving payment settings:', error);
          cleanupFailed = true;
        }
      }
    }

    sendJson(response, 200, {
      settings: await withLogoUrl(updated[0]),
      cleanupFailed,
    });
  } catch (error) {
    sendError(response, error);
  }
}

async function authorizeRead(session: PortalSession, projectId: string): Promise<void> {
  if (session.role === 'client') {
    requireRole(session, 'client');
    if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
    await requireProjectAccess(projectId, session.sub);
    return;
  }
  requireAdminPermission(session, 'manage_billing');
}

async function getPaymentSettings(): Promise<PaymentSettingsRecord> {
  const settings = await supabaseRequest<PaymentSettingsRecord[]>(
    `portal_payment_settings?select=${SETTINGS_FIELDS}&id=eq.${SETTINGS_ID}&limit=1`
  );
  if (!settings[0]) throw new HttpError(500, 'Informasi rekening bank belum tersedia.');
  return settings[0];
}

async function withLogoUrl(settings: PaymentSettingsRecord): Promise<PaymentSettingsResponse> {
  if (!settings.bank_logo_path) return { ...settings, bank_logo_url: null };
  if (!isPaymentLogoPath(settings.bank_logo_path)) {
    throw new HttpError(502, 'Lokasi logo bank tidak valid.');
  }
  return { ...settings, bank_logo_url: await createStorageDownloadUrl(settings.bank_logo_path) };
}

function parseLogoFile(value: unknown): LogoFile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Informasi logo bank tidak valid.');
  }
  const file = value as Record<string, unknown>;
  const contentType = typeof file.contentType === 'string' ? file.contentType : '';
  const size = file.size;
  if (
    !Object.prototype.hasOwnProperty.call(LOGO_TYPES, contentType)
    || typeof size !== 'number'
    || !Number.isInteger(size)
    || size < 1
    || size > MAX_LOGO_SIZE
  ) {
    throw new HttpError(400, 'Logo harus berupa JPG, PNG, atau WEBP dengan ukuran maksimal 2 MB.');
  }
  return { contentType, size };
}

function readText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new HttpError(400, `${label} tidak valid.`);
  const text = value.trim();
  if (text.length > maxLength || /[\u0000-\u001f]/.test(text)) {
    throw new HttpError(400, `${label} maksimal ${maxLength} karakter.`);
  }
  return text;
}

function isPaymentLogoPath(path: string): boolean {
  return LOGO_PATH_PATTERN.test(path);
}

function invalidLogoPath(): never {
  throw new HttpError(400, 'Lokasi logo bank tidak valid.');
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
