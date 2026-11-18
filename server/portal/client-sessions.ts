import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, sendError, sendJson } from './http.js';
import { getClientSession, supabaseRequest } from './portal.js';

interface ClientSessionRecord {
  id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_active_at: string;
  expires_at: string;
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const session = await getClientSession(request);
    if (request.method === 'GET') {
      const activeSessions = await supabaseRequest<ClientSessionRecord[]>(
        `portal_client_sessions?select=id,ip_address,user_agent,created_at,last_active_at,expires_at&account_key=eq.${encodeURIComponent(session.account ?? '')}&revoked_at=is.null&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&order=last_active_at.desc`
      );
      sendJson(response, 200, {
        sessions: activeSessions.map((item) => ({ ...item, current: item.id === session.sid })),
      });
      return;
    }

    if (request.method !== 'POST') {
      throw new HttpError(405, 'Metode permintaan tidak didukung.');
    }
    const body = await readJson(request);
    const action = typeof body.action === 'string' ? body.action : '';
    const now = new Date().toISOString();
    const accountFilter = `account_key=eq.${encodeURIComponent(session.account ?? '')}&revoked_at=is.null&expires_at=gt.${encodeURIComponent(now)}`;

    if (action === 'revoke-others') {
      const revoked = await supabaseRequest<Array<{ id: string }>>(
        `portal_client_sessions?${accountFilter}&id=neq.${encodeURIComponent(session.sid ?? '')}&select=id`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ revoked_at: now }),
        }
      );
      sendJson(response, 200, { revoked: revoked.length });
      return;
    }

    if (action === 'revoke') {
      const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
        throw new HttpError(400, 'Sesi yang dipilih tidak valid.');
      }
      if (sessionId === session.sid) {
        throw new HttpError(400, 'Sesi yang sedang digunakan tidak dapat dicabut dari sini.');
      }
      const revoked = await supabaseRequest<Array<{ id: string }>>(
        `portal_client_sessions?${accountFilter}&id=eq.${encodeURIComponent(sessionId)}&select=id`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ revoked_at: now }),
        }
      );
      if (revoked.length !== 1) {
        throw new HttpError(404, 'Sesi tidak ditemukan atau sudah dicabut.');
      }
      sendJson(response, 200, { revoked: 1 });
      return;
    }

    throw new HttpError(400, 'Aksi pengelolaan sesi tidak valid.');
  } catch (error) {
    sendError(response, error);
  }
}
