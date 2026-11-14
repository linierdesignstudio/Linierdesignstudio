import type { ApiRequest, ApiResponse } from '../../_lib/http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from '../../_lib/http.js';
import {
  createStorageObjectPath,
  createStorageUploadUrl,
  deleteStorageObjects,
  getSession,
  requireRole,
} from '../../_lib/portal.js';

const FILE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/plain': 'txt',
  'text/csv': 'csv',
};
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const FILE_PATH_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[0-9a-f-]{36}\.(jpg|png|webp|pdf|doc|docx|xlsx|txt|csv)$/i;

interface UploadRequest {
  name: string;
  contentType: string;
  size: number;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireRole(getSession(request), 'admin');

    if (request.method === 'POST') {
      const body = await readJson(request);
      const projectId = typeof body.projectId === 'string' ? body.projectId : '';
      if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
      if (!Array.isArray(body.files) || body.files.length < 1 || body.files.length > 5) {
        throw new HttpError(400, 'Pilih 1–5 file untuk diunggah.');
      }

      const uploads = await Promise.all(body.files.map(async (value) => {
        const file = parseUpload(value);
        const extension = FILE_TYPES[file.contentType];
        const path = createStorageObjectPath(projectId, extension);
        return {
          ...file,
          path,
          uploadUrl: await createStorageUploadUrl(path),
        };
      }));
      sendJson(response, 200, { uploads });
      return;
    }

    requireMethod(request, 'DELETE');
    const body = await readJson(request);
    if (!Array.isArray(body.paths) || body.paths.length > 5 || body.paths.some((path) => typeof path !== 'string' || !FILE_PATH_PATTERN.test(path))) {
      throw new HttpError(400, 'Daftar file untuk dibersihkan tidak valid.');
    }
    await deleteStorageObjects(body.paths as string[]);
    sendJson(response, 200, { deleted: true });
  } catch (error) {
    sendError(response, error);
  }
}

function parseUpload(value: unknown): UploadRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Informasi file tidak valid.');
  }
  const file = value as Record<string, unknown>;
  const name = typeof file.name === 'string' ? file.name.trim() : '';
  const contentType = typeof file.contentType === 'string' ? file.contentType : '';
  const size = file.size;
  if (
    !name ||
    name.length > 120 ||
    /[\u0000-\u001f]/.test(name) ||
    !Object.prototype.hasOwnProperty.call(FILE_TYPES, contentType) ||
    typeof size !== 'number' ||
    !Number.isInteger(size) ||
    size < 1 ||
    size > MAX_FILE_SIZE
  ) {
    throw new HttpError(400, 'File harus berformat JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX, TXT, atau CSV dan maksimal 20 MB.');
  }
  return { name, contentType, size };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
