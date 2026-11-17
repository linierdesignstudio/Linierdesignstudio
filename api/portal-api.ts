import type { ApiRequest, ApiResponse } from '../server/portal/http.js';
import { HttpError, sendError } from '../server/portal/http.js';
import adminBilling from '../server/portal/admin-billing.js';
import adminChangeOrders from '../server/portal/admin-change-orders.js';
import adminLogin from '../server/portal/admin-login.js';
import adminPasswordResetRequests from '../server/portal/admin-password-reset-requests.js';
import adminProjects from '../server/portal/admin-projects.js';
import adminSession from '../server/portal/admin-session.js';
import adminUpdates from '../server/portal/admin-updates.js';
import adminUploads from '../server/portal/admin-uploads.js';
import notifications from '../server/portal/notifications.js';
import paymentSettings from '../server/portal/payment-settings.js';
import clientBilling from '../server/portal/client-billing.js';
import clientChangeOrders from '../server/portal/client-change-orders.js';
import clientChangePassword from '../server/portal/client-change-password.js';
import clientLogin from '../server/portal/client-login.js';
import clientPasswordResetRequests from '../server/portal/client-password-reset-requests.js';
import clientSession from '../server/portal/client-session.js';
import clientUpdates from '../server/portal/client-updates.js';
import logout from '../server/portal/portal-logout.js';

const routes: Record<string, (request: ApiRequest, response: ApiResponse) => Promise<void>> = {
  'api/portal/admin/billing': adminBilling,
  'api/portal/admin/change-orders': adminChangeOrders,
  'api/portal/admin/login': adminLogin,
  'api/portal/admin/password-reset-requests': adminPasswordResetRequests,
  'api/portal/admin/projects': adminProjects,
  'api/portal/admin/session': adminSession,
  'api/portal/admin/updates': adminUpdates,
  'api/portal/admin/uploads': adminUploads,
  'api/portal/notifications': notifications,
  'api/portal/payment-settings': paymentSettings,
  'api/portal/client/billing': clientBilling,
  'api/portal/client/change-orders': clientChangeOrders,
  'api/portal/client/change-password': clientChangePassword,
  'api/portal/client/login': clientLogin,
  'api/portal/client/password-reset-requests': clientPasswordResetRequests,
  'api/portal/client/session': clientSession,
  'api/portal/client/updates': clientUpdates,
  'api/portal/logout': logout,
};

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const routePath = url.searchParams.get('route')?.replace(/^\/+/, '');
  const route = routePath ? routes[routePath] : undefined;
  if (!route) {
    sendError(response, new HttpError(404, 'Rute portal tidak ditemukan.'));
    return;
  }
  await route(request, response);
}
