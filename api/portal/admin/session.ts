import type { ApiRequest, ApiResponse } from '../../_lib/http';
import { requireMethod, sendError, sendJson } from '../../_lib/http';
import { getSession, requireRole } from '../../_lib/portal';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'GET');
    requireRole(getSession(request), 'admin');
    sendJson(response, 200, { authenticated: true });
  } catch (error) {
    sendError(response, error);
  }
}
