import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { createPasswordHash, getSession, requireRole, supabaseRequest } from '../../_lib/portal.js';

interface AdminProject {
  id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  location: string;
  status: string;
  progress_percent: number;
  created_at: string;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = getSession(request);
    requireRole(session, 'admin');

    if (request.method === 'GET') {
      const projects = await supabaseRequest<AdminProject[]>(
        'client_projects?select=id,project_code,project_name,client_name,location,status,progress_percent,created_at&order=created_at.desc'
      );
      sendJson(response, 200, { projects });
      return;
    }

    requireMethod(request, 'POST');
    const body = await readJson(request);
    const projectCode = text(body.projectCode).toUpperCase();
    const projectName = text(body.projectName);
    const clientName = text(body.clientName);
    const location = text(body.location);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!/^[A-Z0-9_-]{3,32}$/.test(projectCode)) {
      throw new HttpError(400, 'ID proyek harus 3–32 karakter: huruf, angka, tanda hubung, atau garis bawah.');
    }
    if (projectName.length < 2 || projectName.length > 120) {
      throw new HttpError(400, 'Nama proyek harus terdiri dari 2–120 karakter.');
    }
    if (clientName.length < 2 || clientName.length > 120) {
      throw new HttpError(400, 'Nama klien harus terdiri dari 2–120 karakter.');
    }
    if (location.length > 120) {
      throw new HttpError(400, 'Lokasi maksimal 120 karakter.');
    }
    if (password.length < 12 || password.length > 256) {
      throw new HttpError(400, 'Password klien harus terdiri dari minimal 12 karakter.');
    }

    const credentials = createPasswordHash(password);
    const created = await supabaseRequest<AdminProject[]>(
      'client_projects?select=id,project_code,project_name,client_name,location,status,progress_percent,created_at',
      {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          project_code: projectCode,
          project_name: projectName,
          client_name: clientName,
          location,
          status: 'Berjalan',
          progress_percent: 0,
          password_salt: credentials.salt,
          password_hash: credentials.hash,
        }),
      }
    );
    sendJson(response, 201, { project: created[0] });
  } catch (error) {
    sendError(response, error);
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
