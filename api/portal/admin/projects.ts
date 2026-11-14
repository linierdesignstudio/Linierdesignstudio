import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { createPasswordHash, getSession, requireRole, supabaseRequest } from '../../_lib/portal.js';

interface AdminProject {
  id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  location: string;
  start_date: string | null;
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
        'client_projects?select=id,project_code,project_name,client_name,location,start_date,status,progress_percent,created_at&order=created_at.desc'
      );
      sendJson(response, 200, { projects });
      return;
    }

    if (request.method === 'PATCH') {
      const body = await readJson(request);
      const projectId = typeof body.projectId === 'string' ? body.projectId : '';
      const startDate = typeof body.startDate === 'string' ? body.startDate : '';
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      if (!isValidDate(startDate)) throw new HttpError(400, 'Tanggal mulai tidak valid.');
      const updated = await supabaseRequest<AdminProject[]>(
        `client_projects?id=eq.${encodeURIComponent(projectId)}&select=id,project_code,project_name,client_name,location,start_date,status,progress_percent,created_at`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ start_date: startDate }),
        }
      );
      if (!updated[0]) throw new HttpError(404, 'Proyek tidak ditemukan.');
      sendJson(response, 200, { project: updated[0] });
      return;
    }

    requireMethod(request, 'POST');
    const body = await readJson(request);
    const projectCode = text(body.projectCode).toUpperCase();
    const projectName = text(body.projectName);
    const clientName = text(body.clientName);
    const location = text(body.location);
    const startDate = typeof body.startDate === 'string' ? body.startDate : '';
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
    if (!isValidDate(startDate)) {
      throw new HttpError(400, 'Tanggal mulai tidak valid.');
    }
    if (password.length < 12 || password.length > 256) {
      throw new HttpError(400, 'Password klien harus terdiri dari minimal 12 karakter.');
    }

    const credentials = createPasswordHash(password);
    const created = await supabaseRequest<AdminProject[]>(
      'client_projects?select=id,project_code,project_name,client_name,location,start_date,status,progress_percent,created_at',
      {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          project_code: projectCode,
          project_name: projectName,
          client_name: clientName,
          location,
          start_date: startDate,
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
