import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import { getClientSession, supabaseRequest } from './portal.js';

const isProjectId = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'PATCH');
    const session = await getClientSession(request);

    const body = await readJson(request);
    const profileName = typeof body.profileName === 'string' ? body.profileName.trim() : '';
    const clientAddress = typeof body.clientAddress === 'string' ? body.clientAddress.trim() : '';
    const clientPostalCode = typeof body.clientPostalCode === 'string' ? body.clientPostalCode.trim() : '';
    if (!profileName || profileName.length > 120) {
      throw new HttpError(400, 'Nama profil harus diisi dan maksimal 120 karakter.');
    }
    if (clientAddress.length < 10 || clientAddress.length > 500) {
      throw new HttpError(400, 'Alamat lengkap harus terdiri dari 10 hingga 500 karakter.');
    }
    if (!/^[0-9]{5}$/.test(clientPostalCode)) {
      throw new HttpError(400, 'Kode pos harus terdiri dari 5 digit.');
    }

    const projectSession = isProjectId(session.sub);
    const projectFilter = projectSession
      ? `id=eq.${encodeURIComponent(session.sub)}`
      : `client_email=eq.${encodeURIComponent(session.sub)}`;
    const projects = await supabaseRequest<Array<{ id: string; client_email: string | null }>>(
      `client_projects?select=id,client_email&${projectFilter}&order=created_at.asc`
    );
    if (projects.length === 0) {
      throw new HttpError(401, 'Sesi tidak valid. Silakan masuk kembali.');
    }
    const accountEmail = projectSession ? projects[0].client_email : session.sub;
    const filter = accountEmail
      ? `client_email=eq.${encodeURIComponent(accountEmail)}`
      : `id=eq.${encodeURIComponent(projects[0].id)}`;
    const targetProjects = projectSession && accountEmail
      ? await supabaseRequest<Array<{ id: string }>>(`client_projects?select=id&${filter}`)
      : projects;
    if (targetProjects.length === 0) {
      throw new HttpError(401, 'Sesi tidak valid. Silakan masuk kembali.');
    }

    const updatedProjects = await supabaseRequest<Array<{ id: string }>>(
      `client_projects?${filter}&select=id`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          client_profile_name: profileName,
          client_address: clientAddress,
          client_postal_code: clientPostalCode,
        }),
      }
    );
    if (updatedProjects.length !== targetProjects.length) {
      throw new HttpError(409, 'Profil tidak berhasil diperbarui. Silakan coba kembali.');
    }

    sendJson(response, 200, { profileName, clientAddress, clientPostalCode });
  } catch (error) {
    sendError(response, error);
  }
}
