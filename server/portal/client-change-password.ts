import type { ApiRequest, ApiResponse } from './http.js';
import { clearSessionCookie, HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import {
  createPasswordHash,
  getClientSession,
  supabaseRequest,
  verifyPassword,
} from './portal.js';

interface PasswordProject {
  id: string;
  client_email: string | null;
  client_login_salt: string | null;
  client_login_hash: string | null;
  password_salt: string;
  password_hash: string;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    const session = await getClientSession(request);

    const body = await readJson(request);
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    if (currentPassword.length < 1 || currentPassword.length > 256) {
      throw new HttpError(400, 'Masukkan password saat ini.');
    }
    if (newPassword.length < 8 || newPassword.length > 256) {
      throw new HttpError(400, 'Password baru harus terdiri dari 8 hingga 256 karakter.');
    }

    const isProjectSession = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session.sub);
    const accountEmail = isProjectSession ? '' : session.sub;
    const projects = isProjectSession
      ? await supabaseRequest<PasswordProject[]>(
        `client_projects?select=id,client_email,client_login_salt,client_login_hash,password_salt,password_hash&id=eq.${encodeURIComponent(session.sub)}&limit=1`
      )
      : await supabaseRequest<PasswordProject[]>(
        `client_projects?select=id,client_email,client_login_salt,client_login_hash,password_salt,password_hash&client_email=eq.${encodeURIComponent(accountEmail)}&order=created_at.asc`
      );
    const project = projects[0];
    const currentSalt = accountEmail ? project?.client_login_salt : project?.password_salt;
    const currentHash = accountEmail ? project?.client_login_hash : project?.password_hash;
    if (
      !project ||
      !currentSalt ||
      !currentHash ||
      (accountEmail && projects.some((entry) => entry.client_login_salt !== currentSalt || entry.client_login_hash !== currentHash))
    ) {
      clearSessionCookie(response);
      throw new HttpError(401, 'Sesi tidak valid. Silakan masuk kembali.');
    }

    const allowed = await supabaseRequest<boolean>('rpc/portal_allow_login_attempt', {
      method: 'POST',
      body: JSON.stringify({ p_project_id: project.id, p_success: false }),
    });
    if (!allowed) {
      throw new HttpError(429, 'Terlalu banyak percobaan. Coba kembali dalam 15 menit.');
    }
    if (!verifyPassword(currentPassword, currentSalt, currentHash)) {
      throw new HttpError(401, 'Password saat ini tidak sesuai.');
    }

    await supabaseRequest<boolean>('rpc/portal_allow_login_attempt', {
      method: 'POST',
      body: JSON.stringify({ p_project_id: project.id, p_success: true }),
    });

    const nextPassword = createPasswordHash(newPassword);
    const changed = accountEmail
      ? await supabaseRequest<Array<{ id: string }>>(
        `client_projects?client_email=eq.${encodeURIComponent(accountEmail)}&client_login_salt=eq.${encodeURIComponent(currentSalt)}&client_login_hash=eq.${encodeURIComponent(currentHash)}&select=id`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ client_login_salt: nextPassword.salt, client_login_hash: nextPassword.hash }),
        }
      ).then((updated) => updated.length === projects.length)
      : await supabaseRequest<boolean>('rpc/portal_change_client_password', {
        method: 'POST',
        body: JSON.stringify({
          p_project_id: project.id,
          p_current_password_salt: project.password_salt,
          p_current_password_hash: project.password_hash,
          p_new_password_salt: nextPassword.salt,
          p_new_password_hash: nextPassword.hash,
        }),
      })
    if (!changed) {
      throw new HttpError(409, 'Password akun sudah berubah. Gunakan password terbaru lalu coba kembali.');
    }

    await supabaseRequest<Array<{ id: string }>>(
      `portal_client_sessions?account_key=eq.${encodeURIComponent(session.account ?? '')}&revoked_at=is.null&select=id`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ revoked_at: new Date().toISOString() }),
      }
    );
    clearSessionCookie(response);
    sendJson(response, 200, { changed: true });
  } catch (error) {
    sendError(response, error);
  }
}
