import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { supabaseRequest } from '../../_lib/portal.js';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    const body = await readJson(request);
    const projectCode = typeof body.projectCode === 'string' ? body.projectCode.trim().toUpperCase() : '';
    const whatsappNumber = normalizeWhatsapp(body.whatsappNumber);

    if (!/^[A-Z0-9_-]{3,32}$/.test(projectCode)) {
      throw new HttpError(400, 'Masukkan ID proyek yang valid.');
    }
    if (!/^\+[1-9]\d{7,14}$/.test(whatsappNumber)) {
      throw new HttpError(400, 'Masukkan nomor WhatsApp dengan kode negara, misalnya +6281234567890.');
    }

    const projects = await supabaseRequest<Array<{ id: string }>>(
      `client_projects?select=id&project_code=eq.${encodeURIComponent(projectCode)}&limit=1`
    );
    if (projects[0]) {
      const pendingRequests = await supabaseRequest<Array<{ id: string }>>(
        `project_password_reset_requests?select=id&project_id=eq.${encodeURIComponent(projects[0].id)}&status=eq.pending&limit=1`
      );
      if (pendingRequests[0]) {
        await supabaseRequest<unknown>(
          `project_password_reset_requests?id=eq.${encodeURIComponent(pendingRequests[0].id)}`,
          {
            method: 'PATCH',
            body: JSON.stringify({ whatsapp_number: whatsappNumber }),
          }
        );
        sendJson(response, 202, { accepted: true });
        return;
      }

      try {
        await supabaseRequest<Array<{ id: string }>>(
          'project_password_reset_requests?select=id',
          {
            method: 'POST',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify({
              project_id: projects[0].id,
              whatsapp_number: whatsappNumber,
            }),
          }
        );
      } catch (error) {
        if (!(error instanceof HttpError) || error.status !== 409) throw error;
      }
    }

    sendJson(response, 202, { accepted: true });
  } catch (error) {
    sendError(response, error);
  }
}

function normalizeWhatsapp(value: unknown): string {
  return typeof value === 'string' ? value.replace(/[\s()-]/g, '') : '';
}
