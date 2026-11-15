import type { ApiRequest, ApiResponse } from './http.js';
import { requireMethod, sendError, sendJson } from './http.js';
import { getSession, requireAdminPermission } from './portal.js';

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
