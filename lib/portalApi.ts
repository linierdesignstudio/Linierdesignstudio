export interface PortalProject {
  id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  client_email?: string | null;
  location: string;
  status: string;
  progress_percent: number;
  start_date: string | null;
  created_at?: string;
}

export interface PortalUpdate {
  id: string;
  title: string;
  description: string;
  progress_percent: number;
  update_date: string;
  created_at: string;
  attachments: PortalAttachment[];
}

export interface PortalAttachment {
  path: string;
  name: string;
  contentType: string;
  size: number;
  url?: string;
  downloadUrl?: string;
}

export interface PasswordResetRequest {
  id: string;
  project_id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  whatsapp_number: string;
  created_at: string;
}

export async function portalRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error('Respons portal tidak dapat dibaca. Periksa deployment API.');
  }

  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error
      : 'Permintaan portal gagal. Silakan coba kembali.';
    throw new Error(message);
  }

  return result as T;
}
