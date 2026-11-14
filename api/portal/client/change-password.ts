import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { clearSessionCookie, HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import {
  createPasswordHash,
  getSession,
  requireRole,
  supabaseRequest,
  verifyPassword,
} from '../../_lib/portal.js';

interface PasswordProject {
  id: string;
  client_email: string | null;
  password_salt: string;
  password_hash: string;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    const session = getSession(request);
    requireRole(session, 'client');

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
    const projectSessionRecords = isProjectSession
      ? await supabaseRequest<PasswordProject[]>(
        `client_projects?select=id,client_email,password_salt,password_hash&id=eq.${encodeURIComponent(session.sub)}&limit=1`
      )
      : [];
    const accountEmail = isProjectSession ? projectSessionRecords[0]?.client_email ?? '' : session.sub;
    const projects = accountEmail
      ? await supabaseRequest<PasswordProject[]>(
        `client_projects?select=id,client_email,password_salt,password_hash&client_email=eq.${encodeURIComponent(accountEmail)}&order=created_at.asc`
      )
      : projectSessionRecords;
    const project = projects[0];
    if (!project || (accountEmail && projects.some((entry) => entry.password_salt !== project.password_salt || entry.password_hash !== project.password_hash))) {
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
    if (!verifyPassword(currentPassword, project.password_salt, project.password_hash)) {
      throw new HttpError(401, 'Password saat ini tidak sesuai.');
    }

    await supabaseRequest<boolean>('rpc/portal_allow_login_attempt', {
      method: 'POST',
      body: JSON.stringify({ p_project_id: project.id, p_success: true }),
    });

    const nextPassword = createPasswordHash(newPassword);
    const changed = !accountEmail
      ? await supabaseRequest<boolean>('rpc/portal_change_client_password', {
        method: 'POST',
        body: JSON.stringify({
          p_project_id: project.id,
          p_current_password_salt: project.password_salt,
          p_current_password_hash: project.password_hash,
          p_new_password_salt: nextPassword.salt,
          p_new_password_hash: nextPassword.hash,
        }),
      })
      : await supabaseRequest<Array<{ id: string }>>(
        `client_projects?client_email=eq.${encodeURIComponent(accountEmail)}&password_salt=eq.${encodeURIComponent(project.password_salt)}&password_hash=eq.${encodeURIComponent(project.password_hash)}&select=id`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ password_salt: nextPassword.salt, password_hash: nextPassword.hash }),
        }
      ).then((updated) => updated.length === projects.length);
    if (!changed) {
      throw new HttpError(409, 'Password akun sudah berubah. Gunakan password terbaru lalu coba kembali.');
    }

    clearSessionCookie(response);
    sendJson(response, 200, { changed: true });
  } catch (error) {
    sendError(response, error);
  }
}
