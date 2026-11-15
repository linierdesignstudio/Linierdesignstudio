import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { createStorageDownloadUrl, getSession, requireRole, supabaseRequest, type PortalAttachment } from '../../_lib/portal.js';

interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  progress_percent: number;
  update_date: string;
  created_at: string;
  attachments: PortalAttachment[] | null;
}

interface ClientFeedbackRecord {
  id: string;
  project_id: string;
  subject: string;
  message: string;
  reply: string | null;
  replied_by: 'admin' | 'staff' | null;
  created_at: string;
  replied_at: string | null;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (url.searchParams.get('resource') === 'feedback') {
      const session = getSession(request);
      requireRole(session, 'client');

      if (request.method === 'GET') {
        const projectId = getProjectId(request, session.sub);
        await requireProjectAccess(projectId, session.sub);
        const feedback = await supabaseRequest<ClientFeedbackRecord[]>(
          `client_feedback?select=id,project_id,subject,message,reply,replied_by,created_at,replied_at&project_id=eq.${encodeURIComponent(projectId)}&order=created_at.desc`
        );
        sendJson(response, 200, { feedback });
        return;
      }

      requireMethod(request, 'POST');
      const body = await readJson(request);
      const projectId = typeof body.projectId === 'string' ? body.projectId : '';
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      const subject = message.replace(/\s+/g, ' ').slice(0, 120);
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      if (message.length < 1 || message.length > 5000) throw new HttpError(400, 'Isi feedback harus terdiri dari 1 hingga 5000 karakter.');
      await requireProjectAccess(projectId, session.sub);

      const created = await supabaseRequest<ClientFeedbackRecord[]>(
        'client_feedback?select=id,project_id,subject,message,reply,replied_by,created_at,replied_at',
        {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ project_id: projectId, subject, message }),
        }
      );
      if (!created[0]) throw new HttpError(502, 'Feedback tidak dapat disimpan. Silakan coba kembali.');
      sendJson(response, 201, { feedback: created[0] });
      return;
    }

    requireMethod(request, 'GET');
    const session = getSession(request);
    requireRole(session, 'client');
    const projectId = getProjectId(request, session.sub);
    await requireProjectAccess(projectId, session.sub);

    const storedUpdates = await supabaseRequest<ProjectUpdate[]>(
      `project_updates?select=id,title,description,progress_percent,update_date,created_at,attachments&project_id=eq.${encodeURIComponent(projectId)}&order=update_date.desc,created_at.desc`
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
  } catch (error) {
    sendError(response, error);
  }
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
