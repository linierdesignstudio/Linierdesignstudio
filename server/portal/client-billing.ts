import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import {
  createStorageDownloadUrl,
  createStorageObjectPath,
  createStorageUploadUrl,
  deleteStorageObjects,
  getSession,
  requireRole,
  supabaseRequest,
} from './portal.js';

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

interface ProofFile {
  name: string;
  contentType: string;
  size: number;
}

const BILLING_FIELDS = 'id,project_id,title,amount,due_date,status,payment_proof_path,payment_proof_name,payment_proof_content_type,proof_upload_expires_at,payment_proof_submitted_at,payment_review_note,paid_at,created_at';
const PROOF_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};
const MAX_PROOF_SIZE = 5 * 1024 * 1024;
const UPLOAD_WINDOW_MS = 10 * 60 * 1000;

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = getSession(request);
    requireRole(session, 'client');
    const url = new URL(request.url ?? '/', 'http://localhost');
    const projectId = getProjectId(request, session.sub);
    await requireProjectAccess(projectId, session.sub);

    if (request.method === 'GET') {
      let items = await supabaseRequest<BillingRecord[]>(
        `project_billing_items?select=${BILLING_FIELDS}&project_id=eq.${encodeURIComponent(projectId)}&order=due_date.asc,created_at.asc`
      );
      items = await expireAbandonedUploads(items);
      sendJson(response, 200, { items: await addProofUrls(items) });
      return;
    }

    requireMethod(request, 'POST');
    const body = await readJson(request);
    const action = typeof body.action === 'string' ? body.action : '';
    const itemId = typeof body.itemId === 'string' ? body.itemId : '';
    if (!isUuid(itemId)) throw new HttpError(400, 'Termin pembayaran yang dipilih tidak valid.');

    if (action === 'start-upload') {
      const file = parseProofFile(body.file);
      const current = await getBillingItem(itemId, projectId);
      let latest = current;
      if (current.status === 'uploading' && current.proof_upload_expires_at
        && new Date(current.proof_upload_expires_at).getTime() <= Date.now()) {
        latest = await resetExpiredUpload(current);
      } else if (current.status === 'uploading') {
        throw new HttpError(409, 'Unggahan bukti pembayaran masih berlangsung. Coba kembali beberapa menit lagi.');
      }
      if (latest.status !== 'unpaid' && latest.status !== 'rejected') {
        throw new HttpError(409, 'Bukti pembayaran tidak dapat diunggah untuk status termin ini.');
      }

      const extension = PROOF_TYPES[file.contentType];
      const path = createStorageObjectPath(projectId, extension);
      const uploadUrl = await createStorageUploadUrl(path);
      const expiresAt = new Date(Date.now() + UPLOAD_WINDOW_MS).toISOString();
      const updated = await supabaseRequest<BillingRecord[]>(
        `project_billing_items?id=eq.${encodeURIComponent(itemId)}&project_id=eq.${encodeURIComponent(projectId)}&status=eq.${latest.status}&select=${BILLING_FIELDS}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            status: 'uploading',
            payment_proof_path: path,
            payment_proof_name: file.name,
            payment_proof_content_type: file.contentType,
            proof_upload_expires_at: expiresAt,
            payment_review_note: null,
          }),
        }
      );
      if (!updated[0]) throw new HttpError(409, 'Status termin berubah. Muat ulang portal sebelum mengunggah bukti.');
      let cleanupFailed = false;
      if (latest.payment_proof_path && isStoredProofPath(latest.payment_proof_path, projectId)) {
        try {
          await deleteStorageObjects([latest.payment_proof_path]);
        } catch (error) {
          console.error('Previous payment proof cleanup failed:', error);
          cleanupFailed = true;
        }
      }
      sendJson(response, 200, { uploadUrl, item: updated[0], cleanupFailed });
      return;
    }

    if (action === 'complete-upload') {
      const current = await getBillingItem(itemId, projectId);
      if (
        current.status !== 'uploading'
        || !current.proof_upload_expires_at
        || new Date(current.proof_upload_expires_at).getTime() <= Date.now()
        || !current.payment_proof_path
        || !isStoredProofPath(current.payment_proof_path, projectId)
      ) {
        throw new HttpError(409, 'Sesi unggah sudah berakhir. Silakan unggah bukti kembali.');
      }
      const updated = await supabaseRequest<BillingRecord[]>(
        `project_billing_items?id=eq.${encodeURIComponent(itemId)}&project_id=eq.${encodeURIComponent(projectId)}&status=eq.uploading&payment_proof_path=eq.${encodeURIComponent(current.payment_proof_path)}&proof_upload_expires_at=gt.${encodeURIComponent(current.proof_upload_expires_at)}&select=${BILLING_FIELDS}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            status: 'pending_review',
            proof_upload_expires_at: null,
            payment_proof_submitted_at: new Date().toISOString(),
          }),
        }
      );
      if (!updated[0]) throw new HttpError(409, 'Bukti pembayaran sudah diproses atau sesi unggah sudah berakhir.');
      sendJson(response, 200, { item: updated[0] });
      return;
    }

    if (action === 'cancel-upload') {
      const current = await getBillingItem(itemId, projectId);
      if (current.status !== 'uploading') {
        throw new HttpError(409, 'Tidak ada unggahan yang dapat dibatalkan.');
      }
      const updated = await supabaseRequest<BillingRecord[]>(
        `project_billing_items?id=eq.${encodeURIComponent(itemId)}&project_id=eq.${encodeURIComponent(projectId)}&status=eq.uploading&payment_proof_path=eq.${encodeURIComponent(current.payment_proof_path ?? '')}&select=${BILLING_FIELDS}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            status: 'unpaid',
            payment_proof_path: null,
            payment_proof_name: null,
            payment_proof_content_type: null,
            proof_upload_expires_at: null,
          }),
        }
      );
      if (!updated[0]) throw new HttpError(409, 'Unggahan sudah diproses dan tidak dapat dibatalkan.');
      if (current.payment_proof_path && isStoredProofPath(current.payment_proof_path, projectId)) {
        await deleteStorageObjects([current.payment_proof_path]);
      }
      sendJson(response, 200, { item: updated[0] });
      return;
    }

    throw new HttpError(400, 'Aksi bukti pembayaran tidak valid.');
  } catch (error) {
    sendError(response, error);
  }
}

async function getBillingItem(itemId: string, projectId: string): Promise<BillingRecord> {
  const items = await supabaseRequest<BillingRecord[]>(
    `project_billing_items?id=eq.${encodeURIComponent(itemId)}&project_id=eq.${encodeURIComponent(projectId)}&select=${BILLING_FIELDS}&limit=1`
  );
  if (!items[0]) throw new HttpError(404, 'Termin pembayaran tidak ditemukan.');
  return items[0];
}

async function expireAbandonedUploads(items: BillingRecord[]): Promise<BillingRecord[]> {
  const now = Date.now();
  return Promise.all(items.map(async (item) => {
    if (
      item.status !== 'uploading'
      || !item.proof_upload_expires_at
      || new Date(item.proof_upload_expires_at).getTime() > now
    ) return item;
    return resetExpiredUpload(item);
  }));
}

async function resetExpiredUpload(item: BillingRecord): Promise<BillingRecord> {
  const updated = await supabaseRequest<BillingRecord[]>(
    `project_billing_items?id=eq.${encodeURIComponent(item.id)}&project_id=eq.${encodeURIComponent(item.project_id)}&status=eq.uploading&proof_upload_expires_at=lte.${encodeURIComponent(new Date().toISOString())}&payment_proof_path=eq.${encodeURIComponent(item.payment_proof_path ?? '')}&select=${BILLING_FIELDS}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        status: 'unpaid',
        payment_proof_path: null,
        payment_proof_name: null,
        payment_proof_content_type: null,
        proof_upload_expires_at: null,
      }),
    }
  );
  if (!updated[0]) return getBillingItem(item.id, item.project_id);
  if (item.payment_proof_path && isStoredProofPath(item.payment_proof_path, item.project_id)) {
    await deleteStorageObjects([item.payment_proof_path]);
  }
  return updated[0];
}

async function addProofUrls(items: BillingRecord[]) {
  return Promise.all(items.map(async (item) => {
    if (!item.payment_proof_path || item.status === 'uploading') return item;
    if (!isStoredProofPath(item.payment_proof_path, item.project_id)) {
      throw new HttpError(502, 'Lokasi bukti pembayaran tidak valid.');
    }
    return {
      ...item,
      payment_proof_url: await createStorageDownloadUrl(item.payment_proof_path, item.payment_proof_name ?? true),
    };
  }));
}

function parseProofFile(value: unknown): ProofFile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Pilih file bukti pembayaran.');
  }
  const file = value as Record<string, unknown>;
  const name = typeof file.name === 'string' ? file.name.trim() : '';
  const contentType = typeof file.contentType === 'string' ? file.contentType : '';
  const size = file.size;
  if (
    !name
    || name.length > 120
    || /[\u0000-\u001f]/.test(name)
    || !Object.prototype.hasOwnProperty.call(PROOF_TYPES, contentType)
    || typeof size !== 'number'
    || !Number.isInteger(size)
    || size < 1
    || size > MAX_PROOF_SIZE
  ) {
    throw new HttpError(400, 'Bukti harus berupa JPG, PNG, WEBP, atau PDF dengan ukuran maksimal 5 MB.');
  }
  return { name, contentType, size };
}

async function requireProjectAccess(projectId: string, subject: string): Promise<void> {
  if (projectId === subject) return;
  const projects = await supabaseRequest<Array<{ id: string }>>(
    `client_projects?select=id&id=eq.${encodeURIComponent(projectId)}&client_email=eq.${encodeURIComponent(subject)}&limit=1`
  );
  if (!projects[0]) throw new HttpError(403, 'Anda tidak memiliki akses ke proyek ini.');
}

function getProjectId(request: ApiRequest, subject: string): string {
  const queryProjectId = new URL(request.url ?? '/', 'http://localhost').searchParams.get('projectId');
  const projectId = queryProjectId ?? (isUuid(subject) ? subject : '');
  if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
  return projectId;
}

function isStoredProofPath(path: string, projectId: string): boolean {
  return path.startsWith(`${projectId}/`) &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|pdf)$/i.test(path.slice(projectId.length + 1));
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
