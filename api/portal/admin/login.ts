import type { ApiRequest, ApiResponse } from '../../_lib/http';
import { HttpError, readJson, requireMethod, sendError, sendJson, setSessionCookie } from '../../_lib/http';
import { createAdminSession, createSession } from '../../_lib/portal';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    const body = await readJson(request);
    const password = typeof body.password === 'string' ? body.password : '';
    if (password.length < 1 || password.length > 256 || !createAdminSession(password)) {
      throw new HttpError(401, 'Password admin tidak sesuai.');
    }
    setSessionCookie(response, createSession('admin', 'studio'));
    sendJson(response, 200, { authenticated: true });
  } catch (error) {
    sendError(response, error);
  }
}
