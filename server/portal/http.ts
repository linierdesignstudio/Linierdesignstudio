import type { IncomingMessage, ServerResponse } from 'node:http';

export type ApiRequest = IncomingMessage & { body?: unknown };
export type ApiResponse = ServerResponse<IncomingMessage>;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export function sendJson(response: ApiResponse, status: number, body: unknown): void {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('Content-Security-Policy', "frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
  if (process.env.NODE_ENV === 'production') {
    response.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
}

export function sendError(response: ApiResponse, error: unknown): void {
  if (error instanceof HttpError) {
    sendJson(response, error.status, { error: error.message });
    return;
  }

  console.error('Portal API request failed:', error);
  sendJson(response, 500, { error: 'Terjadi kesalahan pada server.' });
}

export async function readJson(request: ApiRequest): Promise<Record<string, unknown>> {
  if (request.body !== undefined) {
    if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
      throw new HttpError(400, 'Format permintaan tidak valid.');
    }
    if (Buffer.byteLength(JSON.stringify(request.body)) > 16_384) {
      throw new HttpError(413, 'Permintaan terlalu besar.');
    }
    return request.body as Record<string, unknown>;
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 16_384) {
      throw new HttpError(413, 'Permintaan terlalu besar.');
    }
    chunks.push(buffer);
  }

  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Expected an object');
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'Format permintaan tidak valid.');
  }
}

export function requireMethod(request: ApiRequest, method: string): void {
  if (request.method !== method) {
    throw new HttpError(405, 'Metode permintaan tidak didukung.');
  }
}

export function getCookie(request: ApiRequest, name: string): string | undefined {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return undefined;

  for (const cookie of cookieHeader.split(';')) {
    const separator = cookie.indexOf('=');
    if (separator < 0 || cookie.slice(0, separator).trim() !== name) continue;
    return cookie.slice(separator + 1).trim();
  }
  return undefined;
}

export function setSessionCookie(response: ApiResponse, token: string): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader(
    'Set-Cookie',
    `portal_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secure}`
  );
}

export function clearSessionCookie(response: ApiResponse): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader(
    'Set-Cookie',
    `portal_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`
  );
}
