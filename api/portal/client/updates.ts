import type { ApiRequest, ApiResponse } from '../../_lib/http';
import { requireMethod, sendError, sendJson } from '../../_lib/http';
import { getSession, requireRole, supabaseRequest } from '../../_lib/portal';

interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  progress_percent: number;
  update_date: string;
  created_at: string;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'GET');
    const session = getSession(request);
    requireRole(session, 'client');
    const updates = await supabaseRequest<ProjectUpdate[]>(
      `project_updates?select=id,title,description,progress_percent,update_date,created_at&project_id=eq.${encodeURIComponent(session.sub)}&order=update_date.desc,created_at.desc`
    );
    sendJson(response, 200, { updates });
  } catch (error) {
    sendError(response, error);
  }
}
