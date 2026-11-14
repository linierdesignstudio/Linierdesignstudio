import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson, setSessionCookie } from '../../_lib/http.js';
import {
  createSession,
  supabaseRequest,
  verifyPassword,
  type ProjectRecord,
} from '../../_lib/portal.js';

interface LoginProject extends ProjectRecord {
  client_email: string | null;
  password_salt: string;
  password_hash: string;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    const body = await readJson(request);
    const identifier = typeof body.identifier === 'string'
      ? body.identifier.trim()
      : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!identifier || identifier.length > 254 || password.length < 1 || password.length > 256) {
      throw new HttpError(401, 'ID proyek atau password tidak sesuai.');
    }

    const isProjectCode = /^[A-Z0-9_-]{3,32}$/i.test(identifier);
    const email = isProjectCode ? '' : identifier.toLowerCase();
    if (!isProjectCode && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(401, 'ID proyek, email, atau password tidak sesuai.');
    }

    const projects = await supabaseRequest<LoginProject[]>(
      isProjectCode
        ? `client_projects?select=id,project_code,project_name,client_name,location,status,progress_percent,start_date,client_email,password_salt,password_hash&project_code=eq.${encodeURIComponent(identifier.toUpperCase())}&limit=1`
        : `client_projects?select=id,project_code,project_name,client_name,location,status,progress_percent,start_date,client_email,password_salt,password_hash&client_email=eq.${encodeURIComponent(email)}&order=created_at.asc`
    );
    const project = projects[0];
    if (!project || (!isProjectCode && projects.some((entry) => entry.password_salt !== project.password_salt || entry.password_hash !== project.password_hash))) {
      throw new HttpError(401, 'ID proyek, email, atau password tidak sesuai.');
    }

    const allowed = await supabaseRequest<boolean>('rpc/portal_allow_login_attempt', {
      method: 'POST',
      body: JSON.stringify({ p_project_id: project.id, p_success: false }),
    });
    if (!allowed) {
      throw new HttpError(429, 'Terlalu banyak percobaan masuk. Coba kembali dalam 15 menit.');
    }

    if (!verifyPassword(password, project.password_salt, project.password_hash)) {
      throw new HttpError(401, 'ID proyek, email, atau password tidak sesuai.');
    }

    await supabaseRequest<boolean>('rpc/portal_allow_login_attempt', {
      method: 'POST',
      body: JSON.stringify({ p_project_id: project.id, p_success: true }),
    });
    setSessionCookie(response, createSession('client', isProjectCode ? project.id : email));
    sendJson(response, 200, {
      projects: projects.map(({ id, project_code, project_name, client_name, location, status, progress_percent, start_date }) => ({
        id,
        project_code,
        project_name,
        client_name,
        location,
        status,
        progress_percent,
        start_date,
      })),
    });
  } catch (error) {
    sendError(response, error);
  }
}
