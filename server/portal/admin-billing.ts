import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import { createStorageDownloadUrl, getSession, requireAdminPermission, supabaseRequest } from './portal.js';

interface BillingRecord {
  id: string;
  project_id: string;
  title: string;
  amount: string;
  due_date: string;
  status: 'unpaid' | 'uploading' | 'pending_review' | 'rejected' | 'paid';
  payment_proof_path: string | null;
  payment_proof_name: string | null;
  payment_proof_content_type: string | null;
  proof_upload_expires_at: string | null;
  payment_proof_submitted_at: string | null;
  payment_review_note: string | null;
  paid_at: string | null;
  created_at: string;
}

const BILLING_FIELDS = 'id,project_id,title,amount,due_date,status,payment_proof_path,payment_proof_name,payment_proof_content_type,proof_upload_expires_at,payment_proof_submitted_at,payment_review_note,paid_at,created_at';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = getSession(request);
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'GET') {
      requireAdminPermission(session, 'manage_billing');
      const projectId = url.searchParams.get('projectId') ?? '';
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      const items = await supabaseRequest<BillingRecord[]>(
        `project_billing_items?select=${BILLING_FIELDS}&project_id=eq.${encodeURIComponent(projectId)}&order=due_date.asc,created_at.asc`
      );
      sendJson(response, 200, { items: await addProofUrls(items) });
      return;
    }

    if (request.method === 'POST') {
      requireAdminPermission(session, 'manage_billing');
      const body = await readJson(request);
      const projectId = typeof body.projectId === 'string' ? body.projectId : '';
      const title = text(body.title);
      const amount = typeof body.amount === 'number' ? body.amount : Number(body.amount);
      const dueDate = typeof body.dueDate === 'string' ? body.dueDate : '';
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      if (title.length < 1 || title.length > 120) throw new HttpError(400, 'Nama termin harus terdiri dari 1 hingga 120 karakter.');
      if (!Number.isSafeInteger(amount) || amount < 1) throw new HttpError(400, 'Nominal harus berupa bilangan bulat Rupiah yang lebih besar dari 0.');
      if (!isValidDate(dueDate)) throw new HttpError(400, 'Tanggal jatuh tempo tidak valid.');

      const created = await supabaseRequest<BillingRecord[]>(
        `project_billing_items?select=${BILLING_FIELDS}`,
        {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ project_id: projectId, title, amount, due_date: dueDate }),
        }
      );
      if (!created[0]) throw new HttpError(502, 'Termin pembayaran tidak dapat disimpan.');
      sendJson(response, 201, { item: created[0] });
      return;
    }

    if (request.method === 'PATCH') {
      requireAdminPermission(session, 'manage_billing');
      const body = await readJson(request);
      const itemId = typeof body.itemId === 'string' ? body.itemId : '';
      const status = body.status;
      const reviewNote = text(body.reviewNote);
      if (!isUuid(itemId)) throw new HttpError(400, 'Termin pembayaran yang dipilih tidak valid.');
      if (status !== 'paid' && status !== 'rejected') throw new HttpError(400, 'Status pembayaran tidak valid.');
      if (status === 'rejected' && (reviewNote.length < 1 || reviewNote.length > 1000)) {
        throw new HttpError(400, 'Catatan penolakan bukti harus terdiri dari 1 hingga 1000 karakter.');
      }

      const updated = await supabaseRequest<BillingRecord[]>(
        `project_billing_items?id=eq.${encodeURIComponent(itemId)}&status=eq.pending_review&select=${BILLING_FIELDS}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(status === 'paid'
            ? { status, paid_at: new Date().toISOString(), payment_review_note: null }
            : { status, paid_at: null, payment_review_note: reviewNote }),
        }
      );
      if (!updated[0]) throw new HttpError(409, 'Bukti pembayaran sudah diproses atau tidak lagi menunggu pemeriksaan.');
      sendJson(response, 200, { item: updated[0] });
      return;
    }

    requireMethod(request, 'DELETE');
    requireAdminPermission(session, 'manage_billing');
    const body = await readJson(request);
    const itemId = typeof body.itemId === 'string' ? body.itemId : '';
    if (!isUuid(itemId)) throw new HttpError(400, 'Termin pembayaran yang dipilih tidak valid.');
    const deleted = await supabaseRequest<Array<{ id: string }>>(
      `project_billing_items?id=eq.${encodeURIComponent(itemId)}&status=eq.unpaid&payment_proof_path=is.null&select=id`,
      { method: 'DELETE', headers: { Prefer: 'return=representation' } }
    );
    if (!deleted[0]) throw new HttpError(409, 'Hanya termin yang belum memiliki bukti pembayaran dan belum diproses yang dapat dihapus.');
    sendJson(response, 200, { deleted: true });
  } catch (error) {
    sendError(response, error);
  }
}

async function addProofUrls(items: BillingRecord[]) {
  return Promise.all(items.map(async (item) => {
    if (!item.payment_proof_path || item.status === 'uploading') return item;
    if (!isUuid(item.project_id) || !isStoredProofPath(item.payment_proof_path, item.project_id)) {
      throw new HttpError(502, 'Lokasi bukti pembayaran tidak valid.');
    }
    try {
      return {
        ...item,
        payment_proof_url: await createStorageDownloadUrl(item.payment_proof_path, item.payment_proof_name ?? true),
      };
    } catch (error) {
      console.error('Admin payment proof link creation failed:', error);
      return { ...item, payment_proof_unavailable: true };
    }
  }));
}

function isStoredProofPath(path: string, projectId: string): boolean {
  return path.startsWith(`${projectId}/`) &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|pdf)$/i.test(path.slice(projectId.length + 1));
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
