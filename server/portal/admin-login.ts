import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson, setSessionCookie } from './http.js';
import { createAdminSession, createSession } from './portal.js';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    const body = await readJson(request);
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (email.length < 1 || email.length > 254 || password.length < 1 || password.length > 256) {
      throw new HttpError(401, 'Email atau password admin tidak sesuai.');
    }
    const role = createAdminSession(email, password);
    if (!role) throw new HttpError(401, 'Email atau password admin tidak sesuai.');
    setSessionCookie(response, createSession(role, email.toLowerCase()));
    sendJson(response, 200, { authenticated: true, role });
  } catch (error) {
    sendError(response, error);
  }
}
