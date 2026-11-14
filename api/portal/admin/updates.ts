import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { getSession, requireRole, supabaseRequest, type PortalAttachment } from '../../_lib/portal.js';

interface CreatedUpdate {
  id: string;
  project_id: string;
  title: string;
  description: string;
  progress_percent: number;
  update_date: string;
  created_at: string;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    requireRole(getSession(request), 'admin');
    const body = await readJson(request);
    const projectId = typeof body.projectId === 'string' ? body.projectId : '';
    const title = text(body.title);
    const description = text(body.description);
    const progressPercent = body.progressPercent;
    const updateDate = typeof body.updateDate === 'string' ? body.updateDate : '';
    const attachments = parseAttachments(body.attachments, projectId);

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId)) {
      throw new HttpError(400, 'Pilih proyek yang valid.');
    }
    if (title.length < 2 || title.length > 120) {
      throw new HttpError(400, 'Judul update harus terdiri dari 2–120 karakter.');
    }
    if (description.length < 2 || description.length > 5000) {
      throw new HttpError(400, 'Catatan progress harus terdiri dari 2–5.000 karakter.');
    }
    if (!Number.isInteger(progressPercent) || Number(progressPercent) < 0 || Number(progressPercent) > 100) {
      throw new HttpError(400, 'Progress harus berupa angka antara 0 dan 100.');
    }
    if (!isValidDate(updateDate)) {
      throw new HttpError(400, 'Tanggal update tidak valid.');
    }

    const updates = await supabaseRequest<CreatedUpdate[]>('rpc/portal_create_project_update', {
      method: 'POST',
      body: JSON.stringify({
        p_project_id: projectId,
        p_title: title,
        p_description: description,
        p_progress_percent: progressPercent,
        p_update_date: updateDate,
        p_attachments: attachments,
      }),
    });
    sendJson(response, 201, { update: updates[0] });
  } catch (error) {
    sendError(response, error);
  }
}

function parseAttachments(value: unknown, projectId: string): PortalAttachment[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 5) {
    throw new HttpError(400, 'Maksimal 5 file dapat ditambahkan ke satu update.');
  }
  return value.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new HttpError(400, 'Informasi lampiran tidak valid.');
    }
    const attachment = item as Record<string, unknown>;
    const path = typeof attachment.path === 'string' ? attachment.path : '';
    const name = text(attachment.name);
    const contentType = typeof attachment.contentType === 'string' ? attachment.contentType : '';
    const size = attachment.size;
    if (
      !path.startsWith(`${projectId}/`) ||
      !/^[0-9a-f-]{36}\.(jpg|png|webp|pdf|doc|docx|xlsx|txt|csv)$/i.test(path.slice(projectId.length + 1)) ||
      name.length < 1 ||
      name.length > 120 ||
      /[\u0000-\u001f]/.test(name) ||
      !['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv'].includes(contentType) ||
      typeof size !== 'number' ||
      !Number.isInteger(size) ||
      size < 1 ||
      size > 20 * 1024 * 1024
    ) {
      throw new HttpError(400, 'Informasi lampiran tidak valid.');
    }
    return { path, name, contentType, size };
  });
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
