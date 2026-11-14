import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { getSession, requireAdminPermission } from '../../_lib/portal.js';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'GET');
    const session = getSession(request);
    requireAdminPermission(session, 'project_read');
    sendJson(response, 200, { authenticated: true, role: session.role });
  } catch (error) {
    sendError(response, error);
  }
}
