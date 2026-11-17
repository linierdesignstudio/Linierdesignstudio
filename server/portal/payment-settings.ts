import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import { PORTAL_BANKS, type PortalBankCode } from '../../lib/portalBanks.js';
import {
  getSession,
  requireAdminPermission,
  requireProjectAccess,
  requireRole,
  supabaseRequest,
  type PortalSession,
} from './portal.js';

interface PaymentAccountRecord {
  bank_code: PortalBankCode;
  account_number: string;
  account_holder: string;
  updated_at: string;
}

const ACCOUNT_FIELDS = 'bank_code,account_number,account_holder,updated_at';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = getSession(request);
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'GET') {
      await authorizeRead(session, url.searchParams.get('projectId') ?? '');
      sendJson(response, 200, { accounts: await getPaymentAccounts() });
      return;
    }

    requireMethod(request, 'PUT');
    requireAdminPermission(session, 'manage_billing');
    const body = await readJson(request);
    const accounts = readAccounts(body.accounts);
    const updatedAt = new Date().toISOString();
    const updated = await supabaseRequest<PaymentAccountRecord[]>(
      `portal_payment_accounts?on_conflict=bank_code&select=${ACCOUNT_FIELDS}`,
      {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(accounts.map((account) => ({ ...account, updated_at: updatedAt }))),
      }
    );
    if (updated.length !== PORTAL_BANKS.length) {
      throw new HttpError(502, 'Informasi rekening bank tidak dapat disimpan.');
    }
    sendJson(response, 200, { accounts: updated });
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

async function getPaymentAccounts(): Promise<PaymentAccountRecord[]> {
  return supabaseRequest<PaymentAccountRecord[]>(
    `portal_payment_accounts?select=${ACCOUNT_FIELDS}&order=bank_code.asc`
  );
}

function readAccounts(value: unknown): Array<Omit<PaymentAccountRecord, 'updated_at'>> {
  if (!Array.isArray(value) || value.length !== PORTAL_BANKS.length) {
    throw new HttpError(400, 'Lengkapi daftar empat rekening bank.');
  }

  const seen = new Set<PortalBankCode>();
  const accounts = value.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new HttpError(400, 'Data rekening bank tidak valid.');
    }
    const account = entry as Record<string, unknown>;
    const bankCode = account.bankCode;
    if (typeof bankCode !== 'string' || !isPortalBankCode(bankCode) || seen.has(bankCode)) {
      throw new HttpError(400, 'Pilihan bank tidak valid atau terduplikasi.');
    }
    seen.add(bankCode);
    return {
      bank_code: bankCode,
      account_number: readText(account.accountNumber, 'Nomor rekening', 64),
      account_holder: readText(account.accountHolder, 'Nama pemilik rekening', 120),
    };
  });

  if (seen.size !== PORTAL_BANKS.length) {
    throw new HttpError(400, 'Lengkapi data rekening untuk BCA, Mandiri, BNI, dan BRI.');
  }
  return accounts;
}

function readText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new HttpError(400, `${label} tidak valid.`);
  const text = value.trim();
  if (text.length > maxLength || /[\u0000-\u001f]/.test(text)) {
    throw new HttpError(400, `${label} maksimal ${maxLength} karakter.`);
  }
  return text;
}

function isPortalBankCode(value: string): value is PortalBankCode {
  return PORTAL_BANKS.some((bank) => bank.value === value);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
