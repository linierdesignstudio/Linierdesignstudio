import type { ApiRequest, ApiResponse } from './http.js';
import { clearSessionCookie, HttpError, requireMethod, sendError, sendJson } from './http.js';
import { getSession, supabaseRequest } from './portal.js';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    clearSessionCookie(response);
    try {
      const session = getSession(request);
      if (session.role === 'client' && session.sid && session.account) {
        await supabaseRequest<Array<{ id: string }>>(
          `portal_client_sessions?id=eq.${encodeURIComponent(session.sid)}&account_key=eq.${encodeURIComponent(session.account)}&revoked_at=is.null&select=id`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify({ revoked_at: new Date().toISOString() }),
          }
        );
      }
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 401) throw error;
    }
    sendJson(response, 200, { authenticated: false });
  } catch (error) {
    sendError(response, error);
  }
}
