import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { createPasswordHash, getSession, requireRole, supabaseRequest, verifyPassword } from '../../_lib/portal.js';

interface AdminProject {
  id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  client_email: string | null;
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
        'client_projects?select=id,project_code,project_name,client_name,client_email,location,start_date,status,progress_percent,created_at&order=created_at.desc'
      );
      sendJson(response, 200, { projects });
      return;
    }

    if (request.method === 'PATCH') {
      const body = await readJson(request);
      const projectId = typeof body.projectId === 'string' ? body.projectId : '';
      if (typeof body.clientEmail === 'string' || typeof body.clientPassword === 'string') {
        const clientEmail = text(body.clientEmail).toLowerCase();
        const clientPassword = typeof body.clientPassword === 'string' ? body.clientPassword : '';
        if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
        if (!isValidEmail(clientEmail)) throw new HttpError(400, 'Masukkan email klien yang valid.');
        if (clientPassword.length < 8 || clientPassword.length > 256) {
          throw new HttpError(400, 'Password akun klien harus terdiri dari 8 hingga 256 karakter.');
        }

        const existingAccounts = await supabaseRequest<Array<{ password_salt: string; password_hash: string }>>(
          `client_projects?select=password_salt,password_hash&client_email=eq.${encodeURIComponent(clientEmail)}&order=created_at.asc&limit=1`
        );
        if (!existingAccounts[0] && clientPassword.length < 12) {
          throw new HttpError(400, 'Password akun klien baru minimal 12 karakter.');
        }
        const existingAccount = existingAccounts[0];
        if (existingAccount && !verifyPassword(clientPassword, existingAccount.password_salt, existingAccount.password_hash)) {
          throw new HttpError(409, 'Email klien sudah terhubung ke akun lain. Gunakan password akun yang sama.');
        }
        let credentials: { password_salt: string; password_hash: string };
        if (existingAccount) {
          credentials = existingAccount;
        } else {
          const generated = createPasswordHash(clientPassword);
          credentials = { password_salt: generated.salt, password_hash: generated.hash };
        }

        const updated = await supabaseRequest<AdminProject[]>(
          `client_projects?id=eq.${encodeURIComponent(projectId)}&select=id,project_code,project_name,client_name,client_email,location,start_date,status,progress_percent,created_at`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify({
              client_email: clientEmail,
              password_salt: credentials.password_salt,
              password_hash: credentials.password_hash,
            }),
          }
        );
        if (!updated[0]) throw new HttpError(404, 'Proyek tidak ditemukan.');
        sendJson(response, 200, { project: updated[0] });
        return;
      }

      const startDate = typeof body.startDate === 'string' ? body.startDate : '';
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      if (!isValidDate(startDate)) throw new HttpError(400, 'Tanggal mulai tidak valid.');
      const updated = await supabaseRequest<AdminProject[]>(
        `client_projects?id=eq.${encodeURIComponent(projectId)}&select=id,project_code,project_name,client_name,client_email,location,start_date,status,progress_percent,created_at`,
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
    const clientEmail = text(body.clientEmail).toLowerCase();
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
    if (!isValidEmail(clientEmail)) {
      throw new HttpError(400, 'Masukkan email klien yang valid.');
    }
    if (location.length > 120) {
      throw new HttpError(400, 'Lokasi maksimal 120 karakter.');
    }
    if (!isValidDate(startDate)) {
      throw new HttpError(400, 'Tanggal mulai tidak valid.');
    }
    if (password.length < 8 || password.length > 256) {
      throw new HttpError(400, 'Password klien harus terdiri dari minimal 8 karakter.');
    }

    const existingAccounts = await supabaseRequest<Array<{ password_salt: string; password_hash: string }>>(
      `client_projects?select=password_salt,password_hash&client_email=eq.${encodeURIComponent(clientEmail)}&order=created_at.asc&limit=1`
    );
    if (!existingAccounts[0] && password.length < 12) {
      throw new HttpError(400, 'Password akun klien baru minimal 12 karakter.');
    }
    const existingAccount = existingAccounts[0];
    if (existingAccount && !verifyPassword(password, existingAccount.password_salt, existingAccount.password_hash)) {
      throw new HttpError(409, 'Email ini sudah memiliki akun klien. Gunakan password akun yang sama.');
    }
    let credentials: { password_salt: string; password_hash: string };
    if (existingAccount) {
      credentials = existingAccount;
    } else {
      const generated = createPasswordHash(password);
      credentials = { password_salt: generated.salt, password_hash: generated.hash };
    }

    const created = await supabaseRequest<AdminProject[]>(
      'client_projects?select=id,project_code,project_name,client_name,client_email,location,start_date,status,progress_percent,created_at',
      {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          project_code: projectCode,
          project_name: projectName,
          client_name: clientName,
          client_email: clientEmail,
          location,
          start_date: startDate,
          status: 'Berjalan',
          progress_percent: 0,
          password_salt: credentials.password_salt,
          password_hash: credentials.password_hash,
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

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
