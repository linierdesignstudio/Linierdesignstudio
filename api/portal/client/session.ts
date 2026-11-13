import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { clearSessionCookie, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { getProjectById, getSession, requireRole } from '../../_lib/portal.js';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'GET');
    const session = getSession(request);
    requireRole(session, 'client');
    const project = await getProjectById(session.sub);
    if (!project) {
      clearSessionCookie(response);
      sendJson(response, 401, { error: 'Sesi tidak valid. Silakan masuk kembali.' });
      return;
    }
    sendJson(response, 200, { project });
  } catch (error) {
    sendError(response, error);
  }
}
