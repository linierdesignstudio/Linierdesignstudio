import { createHash, createHmac, randomBytes } from 'node:crypto';
import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, readJson, requireMethod, sendError, sendJson } from './http.js';
import { createPasswordHash, supabaseRequest } from './portal.js';
import { getPasswordResetEmailConfig, sendPasswordResetEmail } from './email.js';

interface ResetProject {
  id: string;
  client_name: string;
  client_email: string | null;
}

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'POST');
    const body = await readJson(request);
    const action = typeof body.action === 'string' ? body.action : '';

    if (action === 'request') {
      await requestReset(body.identifier, response);
      return;
    }

    if (action === 'complete') {
      await completeReset(body.token, body.newPassword, response);
      return;
    }

    throw new HttpError(400, 'Permintaan reset password tidak valid.');
  } catch (error) {
    sendError(response, error);
  }
}

async function requestReset(identifierValue: unknown, response: ApiResponse): Promise<void> {
  const identifier = typeof identifierValue === 'string' ? identifierValue.trim() : '';
  const isEmail = identifier.includes('@');
  const email = isEmail ? identifier.toLowerCase() : '';
  const projectCode = isEmail ? '' : identifier.toUpperCase();
  if (isEmail ? !isValidEmail(email) : !/^[A-Z0-9_-]{3,32}$/.test(projectCode)) {
    throw new HttpError(400, 'Masukkan ID proyek atau email akun yang valid.');
  }

  const emailConfig = getPasswordResetEmailConfig();
  const projects = await supabaseRequest<ResetProject[]>(
    isEmail
      ? `client_projects?select=id,client_name,client_email&client_email=eq.${encodeURIComponent(email)}&order=created_at.asc&limit=1`
      : `client_projects?select=id,client_name,client_email&project_code=eq.${encodeURIComponent(projectCode)}&limit=1`
  );
  const project = projects[0];
  const recipientEmail = project?.client_email?.trim().toLowerCase();

  if (project && recipientEmail && isValidEmail(recipientEmail)) {
    const credentialType = isEmail ? 'account' : 'project';
    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const sessionSecret = process.env.PORTAL_SESSION_SECRET;
    if (!sessionSecret || sessionSecret.length < 32) {
      throw new HttpError(503, 'Secret sesi portal belum dikonfigurasi dengan aman.');
    }
    const rateKey = createHmac('sha256', sessionSecret)
      .update(`password-reset:${credentialType}:${credentialType === 'account' ? recipientEmail : project.id}`)
      .digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
    const issued = await supabaseRequest<boolean>('rpc/portal_issue_password_reset_token', {
      method: 'POST',
      body: JSON.stringify({
        p_project_id: project.id,
        p_credential_type: credentialType,
        p_account_email: credentialType === 'account' ? recipientEmail : null,
        p_token_hash: tokenHash,
        p_rate_key: rateKey,
        p_expires_at: expiresAt,
      }),
    });

    if (issued) {
      try {
        await sendPasswordResetEmail(emailConfig, recipientEmail, project.client_name, token);
      } catch (error) {
        try {
          await supabaseRequest<Array<{ id: string }>>(
            `portal_password_reset_tokens?token_hash=eq.${encodeURIComponent(tokenHash)}&consumed_at=is.null&select=id`,
            {
              method: 'PATCH',
              headers: { Prefer: 'return=representation' },
              body: JSON.stringify({ consumed_at: new Date().toISOString() }),
            }
          );
        } catch (cleanupError) {
          console.error('Failed to invalidate undelivered password reset token:', cleanupError);
        }
        throw error;
      }
    }
  }

  sendJson(response, 202, { accepted: true });
}

async function completeReset(tokenValue: unknown, passwordValue: unknown, response: ApiResponse): Promise<void> {
  const token = typeof tokenValue === 'string' ? tokenValue : '';
  const password = typeof passwordValue === 'string' ? passwordValue : '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    throw new HttpError(400, 'Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.');
  }
  if (password.length < 8 || password.length > 256) {
    throw new HttpError(400, 'Password baru harus terdiri dari 8 hingga 256 karakter.');
  }

  const credentials = createPasswordHash(password);
  const completed = await supabaseRequest<boolean>('rpc/portal_complete_password_reset', {
    method: 'POST',
    body: JSON.stringify({
      p_token_hash: createHash('sha256').update(token).digest('hex'),
      p_password_salt: credentials.salt,
      p_password_hash: credentials.hash,
    }),
  });
  if (!completed) {
    throw new HttpError(400, 'Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.');
  }

  sendJson(response, 200, { changed: true });
}

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
