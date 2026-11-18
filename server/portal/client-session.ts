import type { ApiRequest, ApiResponse } from './http.js';
import { clearSessionCookie, requireMethod, sendError, sendJson } from './http.js';
import { getProjectById, getSession, requireRole, supabaseRequest, type ProjectRecord } from './portal.js';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'GET');
    const session = getSession(request);
    requireRole(session, 'client');
    const projects = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session.sub)
      ? [await getProjectById(session.sub)].filter((project): project is ProjectRecord => project !== null)
      : await supabaseRequest<ProjectRecord[]>(
        `client_projects?select=id,project_code,project_name,client_name,client_email,project_type,client_phone,location,status,progress_percent,start_date&client_email=eq.${encodeURIComponent(session.sub)}&order=created_at.asc`
      );
    if (projects.length === 0) {
      clearSessionCookie(response);
      sendJson(response, 401, { error: 'Sesi tidak valid. Silakan masuk kembali.' });
      return;
    }
    sendJson(response, 200, { projects });
  } catch (error) {
    sendError(response, error);
  }
}
