import { randomBytes } from 'node:crypto';
import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { createPasswordHash, getSession, requireAdminPermission, supabaseRequest } from '../../_lib/portal.js';

interface ResetRequestRecord {
  id: string;
  project_id: string;
  credential_type: 'project' | 'account';
  whatsapp_number: string;
  created_at: string;
  client_projects: {
    project_code: string;
    project_name: string;
    client_name: string;
    client_email: string | null;
  };
}

interface ResolvedResetRequest {
  request_id: string;
  project_id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  client_email: string | null;
  credential_type: 'project' | 'account';
  whatsapp_number: string;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireAdminPermission(getSession(request), 'process_resets');

    if (request.method === 'GET') {
      const records = await supabaseRequest<ResetRequestRecord[]>(
        'project_password_reset_requests?select=id,project_id,credential_type,whatsapp_number,created_at,client_projects(project_code,project_name,client_name,client_email)&status=eq.pending&order=created_at.asc'
      );
      const requests = records.map((record) => ({
        id: record.id,
        project_id: record.project_id,
        project_code: record.client_projects.project_code,
        project_name: record.client_projects.project_name,
        client_name: record.client_projects.client_name,
        client_email: record.client_projects.client_email,
        credential_type: record.credential_type,
        whatsapp_number: record.whatsapp_number,
        created_at: record.created_at,
      }));
      sendJson(response, 200, { requests });
      return;
    }

    requireMethod(request, 'POST');
    const body = await readJson(request);
    const requestId = typeof body.requestId === 'string' ? body.requestId : '';
    if (!isUuid(requestId)) throw new HttpError(400, 'Permintaan reset tidak valid.');

    const password = randomBytes(12).toString('base64url');
    const credentials = createPasswordHash(password);
    const resolved = await supabaseRequest<ResolvedResetRequest[]>(
      'rpc/portal_resolve_password_reset',
      {
        method: 'POST',
        body: JSON.stringify({
          p_request_id: requestId,
          p_password_salt: credentials.salt,
          p_password_hash: credentials.hash,
        }),
      }
    );
    if (!resolved[0]) throw new HttpError(409, 'Permintaan sudah diproses atau tidak ditemukan.');
    sendJson(response, 200, { password, resetRequest: resolved[0] });
  } catch (error) {
    sendError(response, error);
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
