import type { ApiRequest, ApiResponse } from './http.js';
import { HttpError, requireMethod, sendError, sendJson } from './http.js';
import { getClientSession, requireProjectAccess, supabaseRequest } from './portal.js';

interface PortalInvoiceRecord {
  id: string;
  invoice_number: string;
  billing_item_id: string | null;
  project_id: string;
  issued_at: string;
  due_date: string;
  paid_at: string;
  issuer_name: string;
  issuer_address: string;
  issuer_email: string;
  issuer_phone: string;
  client_name: string;
  client_email: string | null;
  client_phone: string;
  client_address: string;
  client_postal_code: string;
  project_name: string;
  project_code: string;
  project_location: string;
  description: string;
  amount: string;
  payment_bank_code: string | null;
}

const INVOICE_FIELDS = 'id,invoice_number,billing_item_id,project_id,issued_at,due_date,paid_at,issuer_name,issuer_address,issuer_email,issuer_phone,client_name,client_email,client_phone,client_address,client_postal_code,project_name,project_code,project_location,description,amount,payment_bank_code';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    requireMethod(request, 'GET');
    const session = await getClientSession(request);
    const projectId = new URL(request.url ?? '/', 'http://localhost').searchParams.get('projectId') ?? '';
    if (!isUuid(projectId)) throw new HttpError(400, 'Pilih proyek yang valid.');
    await requireProjectAccess(projectId, session.sub);

    const invoices = await supabaseRequest<PortalInvoiceRecord[]>(
      `portal_invoices?select=${INVOICE_FIELDS}&project_id=eq.${encodeURIComponent(projectId)}&order=issued_at.desc`
    );
    sendJson(response, 200, { invoices });
  } catch (error) {
    sendError(response, error);
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
