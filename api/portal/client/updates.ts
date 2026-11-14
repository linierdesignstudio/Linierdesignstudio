import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, requireMethod, sendError, sendJson } from '../../_lib/http.js';
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

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'GET');
    const session = getSession(request);
    requireRole(session, 'client');
    const projectId = new URL(request.url ?? '/', 'http://localhost').searchParams.get('projectId')
      ?? (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session.sub) ? session.sub : '');
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId)) {
      throw new HttpError(400, 'Pilih proyek yang valid.');
    }

    if (projectId !== session.sub) {
      const ownedProjects = await supabaseRequest<Array<{ id: string }>>(
        `client_projects?select=id&id=eq.${encodeURIComponent(projectId)}&client_email=eq.${encodeURIComponent(session.sub)}&limit=1`
      );
      if (!ownedProjects[0]) throw new HttpError(403, 'Anda tidak memiliki akses ke proyek ini.');
    }

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
