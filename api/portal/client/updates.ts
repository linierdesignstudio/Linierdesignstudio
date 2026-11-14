import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { requireMethod, sendError, sendJson } from '../../_lib/http.js';
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
    const storedUpdates = await supabaseRequest<ProjectUpdate[]>(
      `project_updates?select=id,title,description,progress_percent,update_date,created_at,attachments&project_id=eq.${encodeURIComponent(session.sub)}&order=update_date.desc,created_at.desc`
    );
    const updates = await Promise.all(storedUpdates.map(async (update) => ({
      ...update,
      attachments: await Promise.all((update.attachments ?? []).map(async (attachment) => ({
        ...attachment,
        url: await createStorageDownloadUrl(attachment.path),
      }))),
    })));
    sendJson(response, 200, { updates });
  } catch (error) {
    sendError(response, error);
  }
}
