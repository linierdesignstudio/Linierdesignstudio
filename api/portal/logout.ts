import type { ApiRequest, ApiResponse } from '../_lib/http';
import { clearSessionCookie, requireMethod, sendError, sendJson } from '../_lib/http';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    clearSessionCookie(response);
    sendJson(response, 200, { authenticated: false });
  } catch (error) {
    sendError(response, error);
  }
}
