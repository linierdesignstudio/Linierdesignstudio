import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import { getSession, requireAdminPermission, supabaseRequest } from '../../_lib/portal.js';

interface AdminFeedbackRecord {
  id: string;
  project_id: string;
  subject: string;
  message: string;
  reply: string | null;
  replied_by: 'admin' | 'staff' | null;
  created_at: string;
  replied_at: string | null;
  client_projects: {
    project_code: string;
    project_name: string;
    client_name: string;
    client_email: string | null;
  };
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = getSession(request);
    requireAdminPermission(session, 'feedback_manage');

    if (request.method === 'GET') {
      const records = await supabaseRequest<AdminFeedbackRecord[]>(
        'client_feedback?select=id,project_id,subject,message,reply,replied_by,created_at,replied_at,client_projects(project_code,project_name,client_name,client_email)&order=created_at.desc'
      );
      const feedback = records.map(({ client_projects: project, ...item }) => ({
        ...item,
        project_code: project.project_code,
        project_name: project.project_name,
        client_name: project.client_name,
        client_email: project.client_email,
      }));
      sendJson(response, 200, { feedback });
      return;
    }

    requireMethod(request, 'POST');
    const body = await readJson(request);
    const feedbackId = typeof body.feedbackId === 'string' ? body.feedbackId : '';
    const reply = typeof body.reply === 'string' ? body.reply.trim() : '';
    if (!isUuid(feedbackId)) throw new HttpError(400, 'Feedback yang dipilih tidak valid.');
    if (reply.length < 1 || reply.length > 5000) throw new HttpError(400, 'Balasan harus terdiri dari 1 hingga 5000 karakter.');
    const repliedAt = new Date().toISOString();

    const updated = await supabaseRequest<Array<{ id: string }>>(
      `client_feedback?id=eq.${encodeURIComponent(feedbackId)}&select=id`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ reply, replied_by: session.role, replied_at: repliedAt }),
      }
    );
    if (!updated[0]) throw new HttpError(404, 'Feedback tidak ditemukan.');
    sendJson(response, 200, { reply, replied_by: session.role, replied_at: repliedAt });
  } catch (error) {
    sendError(response, error);
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
