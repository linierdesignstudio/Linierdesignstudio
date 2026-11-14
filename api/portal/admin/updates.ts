import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { createStorageDownloadUrl, deleteStorageObjects, getSession, requireAdminPermission, supabaseRequest, type PortalAttachment } from '../../_lib/portal.js';

interface ProjectUpdateRecord {
  id: string;
  project_id: string;
  title: string;
  description: string;
  progress_percent: number;
  update_date: string;
  created_at: string;
  attachments: PortalAttachment[] | null;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = getSession(request);

    if (request.method === 'GET') {
      requireAdminPermission(session, 'project_read');
      const projectId = new URL(request.url ?? '/', 'http://localhost').searchParams.get('projectId') ?? '';
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      const storedUpdates = await supabaseRequest<ProjectUpdateRecord[]>(
        `project_updates?select=id,project_id,title,description,progress_percent,update_date,created_at,attachments&project_id=eq.${encodeURIComponent(projectId)}&order=update_date.desc,created_at.desc`
      );
      const updates = await Promise.all(storedUpdates.map(async (update) => ({
        ...update,
        attachments: await Promise.all((update.attachments ?? []).map(async (attachment) => ({
          ...attachment,
          url: await createStorageDownloadUrl(attachment.path),
          downloadUrl: await createStorageDownloadUrl(attachment.path, attachment.name),
        }))),
      })));
      sendJson(response, 200, { updates });
      return;
    }

    if (request.method === 'PATCH') {
      requireAdminPermission(session, 'manage_updates');
      const body = await readJson(request);
      const updateId = typeof body.updateId === 'string' ? body.updateId : '';
      const projectId = typeof body.projectId === 'string' ? body.projectId : '';
      if (!isUuid(updateId)) throw new HttpError(400, 'Pilih update yang valid.');
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      const fields = parseUpdateFields(body, projectId);
      const updates = await supabaseRequest<ProjectUpdateRecord[]>('rpc/portal_update_project_update', {
        method: 'POST',
        body: JSON.stringify({
          p_update_id: updateId,
          p_title: fields.title,
          p_description: fields.description,
          p_progress_percent: fields.progressPercent,
          p_update_date: fields.updateDate,
          p_attachments: fields.attachments,
        }),
      });
      if (!updates[0]) throw new HttpError(404, 'Update tidak ditemukan.');
      sendJson(response, 200, { update: updates[0] });
      return;
    }

    if (request.method === 'DELETE') {
      requireAdminPermission(session, 'delete_updates');
      const body = await readJson(request);
      const updateId = typeof body.updateId === 'string' ? body.updateId : '';
      if (!isUuid(updateId)) throw new HttpError(400, 'Pilih update yang valid.');
      const deletedUpdates = await supabaseRequest<ProjectUpdateRecord[]>('rpc/portal_delete_project_update', {
        method: 'POST',
        body: JSON.stringify({ p_update_id: updateId }),
      });
      const deletedUpdate = deletedUpdates[0];
      if (!deletedUpdate) throw new HttpError(404, 'Update tidak ditemukan.');

      const attachments = deletedUpdate.attachments ?? [];
      const paths = attachments.map((attachment) => attachment?.path);
      const safePaths = paths.filter((path): path is string =>
        isStoredAttachmentPath(path, deletedUpdate.project_id)
      );
      let cleanupFailed = safePaths.length !== attachments.length;
      if (safePaths.length > 0) {
        try {
          await deleteStorageObjects(safePaths);
        } catch {
          cleanupFailed = true;
        }
      }

      sendJson(response, 200, { deleted: true, cleanupFailed });
      return;
    }

    requireMethod(request, 'POST');
    requireAdminPermission(session, 'manage_updates');
    const body = await readJson(request);
    const projectId = typeof body.projectId === 'string' ? body.projectId : '';
    if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
    const fields = parseUpdateFields(body, projectId);
    const updates = await supabaseRequest<ProjectUpdateRecord[]>('rpc/portal_create_project_update', {
      method: 'POST',
      body: JSON.stringify({
        p_project_id: projectId,
        p_title: fields.title,
        p_description: fields.description,
        p_progress_percent: fields.progressPercent,
        p_update_date: fields.updateDate,
        p_attachments: fields.attachments,
      }),
    });
    sendJson(response, 201, { update: updates[0] });
  } catch (error) {
    sendError(response, error);
  }
}

function parseUpdateFields(body: Record<string, unknown>, projectId: string) {
  const title = text(body.title);
  const description = text(body.description);
  const progressPercent = body.progressPercent;
  const updateDate = typeof body.updateDate === 'string' ? body.updateDate : '';
  const attachments = parseAttachments(body.attachments, projectId);

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
  return { title, description, progressPercent: Number(progressPercent), updateDate, attachments };
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isStoredAttachmentPath(path: unknown, projectId: string): path is string {
  const prefix = `${projectId}/`;
  return typeof path === 'string' &&
    path.startsWith(prefix) &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp|pdf|doc|docx|xlsx|txt|csv)$/i.test(path.slice(prefix.length));
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
