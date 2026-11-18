import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, requireMethod, sendError, sendJson } from './http.js';
import { createStorageDownloadUrl, getClientSession, requireProjectAccess, supabaseRequest } from './portal.js';
import type { PortalProjectDocumentCategory } from '../../lib/portalApi.js';

interface ProjectDocumentRecord {
  id: string;
  project_id: string;
  category: PortalProjectDocumentCategory;
  path: string;
  name: string;
  content_type: string;
  size: number;
  created_at: string;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'GET');
    const session = await getClientSession(request);
    const projectId = new URL(request.url ?? '/', 'http://localhost').searchParams.get('projectId') ?? '';
    if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
    await requireProjectAccess(projectId, session.sub);

    const records = await supabaseRequest<ProjectDocumentRecord[]>(
      `portal_project_documents?select=id,project_id,category,path,name,content_type,size,created_at&project_id=eq.${encodeURIComponent(projectId)}&order=created_at.desc`
    );
    const documents = await Promise.all(records.map(async (record) => ({
      id: record.id,
      project_id: record.project_id,
      category: record.category,
      path: record.path,
      name: record.name,
      contentType: record.content_type,
      size: record.size,
      created_at: record.created_at,
      url: await createStorageDownloadUrl(record.path),
      downloadUrl: await createStorageDownloadUrl(record.path, record.name),
    })));
    sendJson(response, 200, { documents });
  } catch (error) {
    sendError(response, error);
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
