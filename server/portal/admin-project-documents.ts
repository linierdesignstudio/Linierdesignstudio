import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import {
  createStorageDownloadUrl,
  deleteStorageObjects,
  getSession,
  isStoredAttachmentPath,
  requireAdminPermission,
  supabaseRequest,
  type PortalAttachment,
} from './portal.js';
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

const FILE_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = getSession(request);
    if (request.method === 'GET') {
      requireAdminPermission(session, 'project_read');
      const projectId = new URL(request.url ?? '/', 'http://localhost').searchParams.get('projectId') ?? '';
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      const records = await supabaseRequest<ProjectDocumentRecord[]>(
        `portal_project_documents?select=id,project_id,category,path,name,content_type,size,created_at&project_id=eq.${encodeURIComponent(projectId)}&order=created_at.desc`
      );
      sendJson(response, 200, { documents: await addSignedUrls(records) });
      return;
    }

    if (request.method === 'POST') {
      requireAdminPermission(session, 'manage_updates');
      const body = await readJson(request);
      const projectId = typeof body.projectId === 'string' ? body.projectId : '';
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      if (!Array.isArray(body.documents) || body.documents.length < 1 || body.documents.length > 5) {
        throw new HttpError(400, 'Pilih 1–5 dokumen untuk disimpan.');
      }

      const project = await supabaseRequest<Array<{ id: string }>>(
        `client_projects?select=id&id=eq.${encodeURIComponent(projectId)}&limit=1`
      );
      if (!project[0]) throw new HttpError(404, 'Proyek tidak ditemukan.');

      const documents = body.documents.map((item) => parseDocument(item, projectId));
      const records = await supabaseRequest<ProjectDocumentRecord[]>(
        'portal_project_documents?select=id,project_id,category,path,name,content_type,size,created_at',
        {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(documents.map((document) => ({
            project_id: projectId,
            ...document,
          }))),
        }
      );
      sendJson(response, 201, { documents: records.map(toPortalDocument) });
      return;
    }

    requireMethod(request, 'DELETE');
    requireAdminPermission(session, 'manage_updates');
    const body = await readJson(request);
    const documentId = typeof body.documentId === 'string' ? body.documentId : '';
    if (!isUuid(documentId)) throw new HttpError(400, 'Pilih dokumen yang valid.');
    const removed = await supabaseRequest<Array<{ id: string; project_id: string; path: string }>>(
      `portal_project_documents?id=eq.${encodeURIComponent(documentId)}&select=id,project_id,path`,
      {
        method: 'DELETE',
        headers: { Prefer: 'return=representation' },
      }
    );
    if (!removed[0]) throw new HttpError(404, 'Dokumen tidak ditemukan.');

    let cleanupFailed = !isStoredAttachmentPath(removed[0].path, removed[0].project_id);
    if (!cleanupFailed) {
      try {
        await deleteStorageObjects([removed[0].path]);
      } catch {
        cleanupFailed = true;
      }
    }
    sendJson(response, 200, { deleted: true, cleanupFailed });
  } catch (error) {
    sendError(response, error);
  }
}

function parseDocument(value: unknown, projectId: string): Omit<ProjectDocumentRecord, 'id' | 'project_id' | 'created_at'> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Informasi dokumen tidak valid.');
  }
  const document = value as Record<string, unknown>;
  const category = document.category;
  const path = typeof document.path === 'string' ? document.path : '';
  const name = typeof document.name === 'string' ? document.name.trim() : '';
  const contentType = typeof document.contentType === 'string' ? document.contentType : '';
  const size = document.size;
  const extension = FILE_TYPES[contentType];
  if (
    (category !== 'contract' && category !== 'other') ||
    !extension ||
    !isStoredAttachmentPath(path, projectId) ||
    !path.toLowerCase().endsWith(`.${extension}`) ||
    !name ||
    name.length > 120 ||
    /[\u0000-\u001f]/.test(name) ||
    typeof size !== 'number' ||
    !Number.isInteger(size) ||
    size < 1 ||
    size > 20 * 1024 * 1024
  ) {
    throw new HttpError(400, 'Informasi dokumen tidak valid.');
  }
  return {
    category,
    path,
    name,
    content_type: contentType,
    size,
  };
}

async function addSignedUrls(records: ProjectDocumentRecord[]) {
  return Promise.all(records.map(async (record) => {
    const attachment = toPortalDocument(record);
    return {
      ...attachment,
      url: await createStorageDownloadUrl(record.path),
      downloadUrl: await createStorageDownloadUrl(record.path, record.name),
    };
  }));
}

function toPortalDocument(record: ProjectDocumentRecord): Omit<PortalAttachment, 'url' | 'downloadUrl'> & {
  id: string;
  project_id: string;
  category: PortalProjectDocumentCategory;
  created_at: string;
} {
  return {
    id: record.id,
    project_id: record.project_id,
    category: record.category,
    created_at: record.created_at,
    path: record.path,
    name: record.name,
    contentType: record.content_type,
    size: record.size,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
