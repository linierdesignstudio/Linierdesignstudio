import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import { getSession, requireAdminPermission, requireProjectAccess, requireRole, supabaseRequest } from './portal.js';

interface NotificationRecord {
  id: string;
  project_id: string;
  event_type: string;
  entity_id: string;
  summary: string;
  action_required: boolean;
  created_at: string;
  read_at: string | null;
  resolved_at: string | null;
  client_projects: {
    project_code: string;
    project_name: string;
  };
}

const NOTIFICATION_FIELDS = 'id,project_id,event_type,entity_id,summary,action_required,created_at,read_at,resolved_at,client_projects(project_code,project_name)';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = getSession(request);
    const url = new URL(request.url ?? '/', 'http://localhost');
    const isClient = session.role === 'client';
    const audience = isClient ? 'client' : 'admin';
    let projectId = '';

    if (isClient) {
      requireRole(session, 'client');
      projectId = url.searchParams.get('projectId') ?? '';
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      await requireProjectAccess(projectId, session.sub);
    } else {
      requireAdminPermission(session, 'project_read');
    }

    if (request.method === 'GET') {
      const projectFilter = isClient ? `&project_id=eq.${encodeURIComponent(projectId)}` : '';
      const rows = await supabaseRequest<NotificationRecord[]>(
        `portal_notifications?select=${NOTIFICATION_FIELDS}&audience=eq.${audience}${projectFilter}&order=created_at.desc&limit=100`
      );
      const notifications = rows
        .filter((item) => session.role !== 'staff' || item.event_type === 'feedback_received')
        .map(({ client_projects: project, ...notification }) => ({
          ...notification,
          project_code: project.project_code,
          project_name: project.project_name,
        }));
      sendJson(response, 200, { notifications });
      return;
    }

    requireMethod(request, 'PATCH');
    const body = await readJson(request);
    const notificationId = typeof body.notificationId === 'string' ? body.notificationId : '';
    if (!isUuid(notificationId)) throw new HttpError(400, 'Notifikasi yang dipilih tidak valid.');
    if (session.role === 'staff') requireAdminPermission(session, 'feedback_manage');

    const projectFilter = isClient ? `&project_id=eq.${encodeURIComponent(projectId)}` : '';
    const eventFilter = session.role === 'staff' ? '&event_type=eq.feedback_received' : '';
    await supabaseRequest<Array<{ id: string }>>(
      `portal_notifications?id=eq.${encodeURIComponent(notificationId)}&audience=eq.${audience}${projectFilter}${eventFilter}&select=id`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ read_at: new Date().toISOString() }),
      }
    );
    sendJson(response, 200, { read: true });
  } catch (error) {
    sendError(response, error);
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
