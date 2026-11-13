import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson, setSessionCookie } from '../../_lib/http.js';
import {
  createSession,
  supabaseRequest,
  verifyPassword,
  type ProjectRecord,
} from '../../_lib/portal.js';

interface LoginProject extends ProjectRecord {
  password_salt: string;
  password_hash: string;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    const body = await readJson(request);
    const projectCode = typeof body.projectCode === 'string'
      ? body.projectCode.trim().toUpperCase()
      : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!/^[A-Z0-9_-]{3,32}$/.test(projectCode) || password.length < 1 || password.length > 256) {
      throw new HttpError(401, 'ID proyek atau password tidak sesuai.');
    }

    const projects = await supabaseRequest<LoginProject[]>(
      `client_projects?select=id,project_code,project_name,client_name,location,status,progress_percent,password_salt,password_hash&project_code=eq.${encodeURIComponent(projectCode)}&limit=1`
    );
    const project = projects[0];
    if (!project) throw new HttpError(401, 'ID proyek atau password tidak sesuai.');

    const allowed = await supabaseRequest<boolean>('rpc/portal_allow_login_attempt', {
      method: 'POST',
      body: JSON.stringify({ p_project_id: project.id, p_success: false }),
    });
    if (!allowed) {
      throw new HttpError(429, 'Terlalu banyak percobaan masuk. Coba kembali dalam 15 menit.');
    }

    if (!verifyPassword(password, project.password_salt, project.password_hash)) {
      throw new HttpError(401, 'ID proyek atau password tidak sesuai.');
    }

    await supabaseRequest<boolean>('rpc/portal_allow_login_attempt', {
      method: 'POST',
      body: JSON.stringify({ p_project_id: project.id, p_success: true }),
    });
    setSessionCookie(response, createSession('client', project.id));
    sendJson(response, 200, {
      project: {
        id: project.id,
        project_code: project.project_code,
        project_name: project.project_name,
        client_name: project.client_name,
        location: project.location,
        status: project.status,
        progress_percent: project.progress_percent,
      },
    });
  } catch (error) {
    sendError(response, error);
  }
}
