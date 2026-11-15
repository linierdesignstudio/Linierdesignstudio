import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import { getSession, requireAdminPermission, supabaseRequest } from './portal.js';

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
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'GET') {
      requireAdminPermission(session, 'manage_change_orders');
      const projectId = url.searchParams.get('projectId') ?? '';
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      const orders = await supabaseRequest<ChangeOrderRecord[]>(
        `project_change_orders?select=${CHANGE_ORDER_FIELDS}&project_id=eq.${encodeURIComponent(projectId)}&order=created_at.desc`
      );
      sendJson(response, 200, { orders });
      return;
    }

    if (request.method === 'POST') {
      requireAdminPermission(session, 'manage_change_orders');
      const body = await readJson(request);
      const projectId = typeof body.projectId === 'string' ? body.projectId : '';
      const proposal = parseProposal(body);
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      const created = await supabaseRequest<ChangeOrderRecord[]>(
        `project_change_orders?select=${CHANGE_ORDER_FIELDS}`,
        {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            project_id: projectId,
            ...proposal,
            requested_by: 'admin',
            status: 'pending_approval',
            proposed_at: new Date().toISOString(),
          }),
        }
      );
      if (!created[0]) throw new HttpError(502, 'Usulan perubahan tidak dapat disimpan.');
      sendJson(response, 201, { order: created[0] });
      return;
    }

    requireMethod(request, 'PATCH');
    requireAdminPermission(session, 'manage_change_orders');
    const body = await readJson(request);
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    if (!isUuid(orderId)) throw new HttpError(400, 'Permintaan perubahan yang dipilih tidak valid.');
    const proposal = parseProposal(body);
    const adminNote = text(body.adminNote);
    if (adminNote.length > 1000) throw new HttpError(400, 'Catatan admin maksimal 1000 karakter.');

    const current = await supabaseRequest<Array<{ status: ChangeOrderRecord['status'] }>>(
      `project_change_orders?id=eq.${encodeURIComponent(orderId)}&select=status&limit=1`
    );
    if (!current[0]) throw new HttpError(404, 'Permintaan perubahan tidak ditemukan.');
    if (current[0].status !== 'requested' && current[0].status !== 'pending_approval') {
      throw new HttpError(409, 'Permintaan perubahan yang sudah diputuskan tidak dapat diubah.');
    }
    const updated = await supabaseRequest<ChangeOrderRecord[]>(
      `project_change_orders?id=eq.${encodeURIComponent(orderId)}&status=eq.${current[0].status}&select=${CHANGE_ORDER_FIELDS}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          ...proposal,
          status: 'pending_approval',
          admin_note: adminNote || null,
          proposed_at: new Date().toISOString(),
          responded_at: null,
          client_response_note: null,
        }),
      }
    );
    if (!updated[0]) throw new HttpError(409, 'Permintaan perubahan baru saja diputuskan. Muat ulang daftar.');
    sendJson(response, 200, { order: updated[0] });
  } catch (error) {
    sendError(response, error);
  }
}

function parseProposal(body: Record<string, unknown>) {
  const title = text(body.title);
  const description = text(body.description);
  const costImpact = typeof body.costImpact === 'number' ? body.costImpact : Number(body.costImpact);
  const scheduleImpactDays = typeof body.scheduleImpactDays === 'number'
    ? body.scheduleImpactDays
    : Number(body.scheduleImpactDays);
  if (title.length < 1 || title.length > 120) throw new HttpError(400, 'Judul perubahan harus terdiri dari 1 hingga 120 karakter.');
  if (description.length < 1 || description.length > 5000) throw new HttpError(400, 'Rincian perubahan harus terdiri dari 1 hingga 5000 karakter.');
  if (!Number.isSafeInteger(costImpact)) throw new HttpError(400, 'Dampak biaya harus berupa bilangan bulat Rupiah.');
  if (!Number.isInteger(scheduleImpactDays) || scheduleImpactDays < -3650 || scheduleImpactDays > 3650) {
    throw new HttpError(400, 'Dampak jadwal harus berupa jumlah hari antara -3650 dan 3650.');
  }
  return { title, description, cost_impact: costImpact, schedule_impact_days: scheduleImpactDays };
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
