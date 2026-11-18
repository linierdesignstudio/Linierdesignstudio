export interface PortalProject {
  id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  project_type: string | null;
  client_phone: string;
  client_email?: string | null;
  client_profile_name?: string | null;
  client_last_login_at?: string | null;
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
  credential_type: 'project' | 'account';
  client_email: string | null;
  project_code: string;
  project_name: string;
  client_name: string;
  whatsapp_number: string;
  created_at: string;
}

export interface ClientFeedback {
  id: string;
  project_id: string;
  subject: string;
  message: string;
  reply: string | null;
  replied_by: 'admin' | 'staff' | null;
  created_at: string;
  replied_at: string | null;
}

export interface AdminFeedback extends ClientFeedback {
  project_code: string;
  project_name: string;
  client_name: string;
  client_email: string | null;
}

export type PortalNotificationEvent =
  | 'project_update'
  | 'project_update_edited'
  | 'feedback_received'
  | 'feedback_replied'
  | 'billing_created'
  | 'payment_review'
  | 'payment_paid'
  | 'payment_rejected'
  | 'change_requested'
  | 'change_proposed'
  | 'change_decided';

export interface PortalNotification {
  id: string;
  project_id: string;
  project_code: string;
  project_name: string;
  event_type: PortalNotificationEvent;
  entity_id: string;
  summary: string;
  action_required: boolean;
  created_at: string;
  read_at: string | null;
  resolved_at: string | null;
}

export type BillingStatus = 'unpaid' | 'uploading' | 'pending_review' | 'rejected' | 'paid';

export interface BillingItem {
  id: string;
  project_id: string;
  title: string;
  amount: string;
  due_date: string;
  status: BillingStatus;
  selected_bank_code: string | null;
  payment_proof_path: string | null;
  payment_proof_name: string | null;
  payment_proof_content_type: string | null;
  payment_proof_url?: string;
  payment_proof_unavailable?: boolean;
  payment_proof_submitted_at: string | null;
  payment_review_note: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface PortalPaymentAccount {
  bank_code: string;
  account_number: string;
  account_holder: string;
  updated_at: string;
}

export type ChangeOrderStatus = 'requested' | 'pending_approval' | 'approved' | 'rejected';

export interface ProjectChangeOrder {
  id: string;
  project_id: string;
  title: string;
  description: string;
  requested_by: 'client' | 'admin';
  cost_impact: string;
  schedule_impact_days: number;
  status: ChangeOrderStatus;
  admin_note: string | null;
  client_response_note: string | null;
  created_at: string;
  proposed_at: string | null;
  responded_at: string | null;
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
