import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import { getSession, requireProjectAccess, requireRole, supabaseRequest } from './portal.js';

interface ChangeOrderRecord {
  id: string;
  project_id: string;
  title: string;
  description: string;
  requested_by: 'client' | 'admin';
  cost_impact: string;
  schedule_impact_days: number;
  status: 'requested' | 'pending_approval' | 'approved' | 'rejected';
  admin_note: string | null;
  client_response_note: string | null;
  created_at: string;
  proposed_at: string | null;
  responded_at: string | null;
}

const CHANGE_ORDER_FIELDS = 'id,project_id,title,description,requested_by,cost_impact,schedule_impact_days,status,admin_note,client_response_note,created_at,proposed_at,responded_at';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = getSession(request);
    requireRole(session, 'client');
    const projectId = getProjectId(request, session.sub);
    await requireProjectAccess(projectId, session.sub);

    if (request.method === 'GET') {
      const orders = await supabaseRequest<ChangeOrderRecord[]>(
        `project_change_orders?select=${CHANGE_ORDER_FIELDS}&project_id=eq.${encodeURIComponent(projectId)}&order=created_at.desc`
      );
      sendJson(response, 200, { orders });
      return;
    }

    if (request.method === 'POST') {
      const body = await readJson(request);
      if (body.action !== 'request') throw new HttpError(400, 'Aksi perubahan pekerjaan tidak valid.');
      const title = text(body.title);
      const description = text(body.description);
      if (title.length < 1 || title.length > 120) throw new HttpError(400, 'Judul perubahan harus terdiri dari 1 hingga 120 karakter.');
      if (description.length < 1 || description.length > 5000) throw new HttpError(400, 'Rincian perubahan harus terdiri dari 1 hingga 5000 karakter.');

      const created = await supabaseRequest<ChangeOrderRecord[]>(
        `project_change_orders?select=${CHANGE_ORDER_FIELDS}`,
        {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            project_id: projectId,
            title,
            description,
            requested_by: 'client',
            status: 'requested',
          }),
        }
      );
      if (!created[0]) throw new HttpError(502, 'Permintaan perubahan tidak dapat dikirim.');
      sendJson(response, 201, { order: created[0] });
      return;
    }

    requireMethod(request, 'PATCH');
    const body = await readJson(request);
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    const decision = body.decision;
    const responseNote = text(body.responseNote);
    if (!isUuid(orderId)) throw new HttpError(400, 'Permintaan perubahan yang dipilih tidak valid.');
    if (decision !== 'approved' && decision !== 'rejected') throw new HttpError(400, 'Pilih setuju atau tolak untuk usulan perubahan.');
    if (responseNote.length > 1000) throw new HttpError(400, 'Catatan klien maksimal 1000 karakter.');

    const respondedAt = new Date().toISOString();
    const updated = await supabaseRequest<ChangeOrderRecord[]>(
      `project_change_orders?id=eq.${encodeURIComponent(orderId)}&project_id=eq.${encodeURIComponent(projectId)}&status=eq.pending_approval&select=${CHANGE_ORDER_FIELDS}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: decision, client_response_note: responseNote || null, responded_at: respondedAt }),
      }
    );
    if (!updated[0]) throw new HttpError(409, 'Usulan ini sudah tidak menunggu persetujuan atau tidak ditemukan.');
    sendJson(response, 200, { order: updated[0] });
  } catch (error) {
    sendError(response, error);
  }
}

function getProjectId(request: ApiRequest, subject: string): string {
  const queryProjectId = new URL(request.url ?? '/', 'http://localhost').searchParams.get('projectId');
  const projectId = queryProjectId ?? (isUuid(subject) ? subject : '');
  if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
  return projectId;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
