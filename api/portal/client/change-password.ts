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

    const projects = await supabaseRequest<PasswordProject[]>(
      `client_projects?select=id,password_salt,password_hash&id=eq.${encodeURIComponent(session.sub)}&limit=1`
    );
    const project = projects[0];
    if (!project) {
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

    const nextPassword = createPasswordHash(newPassword);
    const changed = await supabaseRequest<boolean>('rpc/portal_change_client_password', {
      method: 'POST',
      body: JSON.stringify({
        p_project_id: project.id,
        p_current_password_salt: project.password_salt,
        p_current_password_hash: project.password_hash,
        p_new_password_salt: nextPassword.salt,
        p_new_password_hash: nextPassword.hash,
      }),
    });
    if (!changed) {
      throw new HttpError(409, 'Password akun sudah berubah. Gunakan password terbaru lalu coba kembali.');
    }

    await supabaseRequest<boolean>('rpc/portal_allow_login_attempt', {
      method: 'POST',
      body: JSON.stringify({ p_project_id: project.id, p_success: true }),
    });
    sendJson(response, 200, { changed: true });
  } catch (error) {
    sendError(response, error);
  }
}
