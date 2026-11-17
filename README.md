<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/fc45b256-1696-4d4a-a7fa-adc6ff083b5d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Client progress portal

The client portal uses Vercel Functions and Supabase. Client passwords and project updates are not stored in the browser.
Portal API paths are routed through one shared Vercel Function, keeping the deployment below the Hobby plan's 12-function limit.

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor. This creates a private `portal-progress` Storage bucket for project photos, documents, and payment proofs. For an existing portal, run the updated SQL again to add photo attachments, construction start dates, password-reset requests, client password changes, separate client email-account credentials, client feedback, billing installments, shared BCA, Mandiri, BNI, and BRI account settings, per-installment bank selections, change orders, persistent portal notifications, and the project-deletion RPC. The notification table and triggers are required for the activity and action panels in both portals.
2. Add these environment variables to Vercel (and to `.env.local` when using `vercel dev`):
   - `SUPABASE_URL` — the Supabase project URL.
   - `SUPABASE_SERVICE_ROLE_KEY` — the server-only service role key. Never expose it with a `VITE_` prefix or commit it.
   - `PORTAL_SESSION_SECRET` — a random secret of at least 32 characters.
   - `PORTAL_ADMIN_EMAIL` — the admin sign-in email address.
   - `PORTAL_ADMIN_PASSWORD` — a unique admin password of at least 16 characters.
   - `PORTAL_STAFF_EMAIL` — the separate staff sign-in email address.
   - `PORTAL_STAFF_PASSWORD` — a unique staff password of at least 16 characters. Set both staff variables together; staff can manage progress updates, process client password-reset requests, and reply to client feedback, but cannot create projects, change client access, delete updates, or access billing and change-order costs.
3. Deploy to Vercel or run `vercel dev`. The Vercel configuration uses the Other framework preset so the `api/` functions are deployed alongside the Vite `dist` output. `npm run dev` alone does not run the API functions.
4. Open the deployed site's URL with `#/portal/admin` appended to sign in, create project IDs and passwords, and optionally add client emails. Projects with the same client email share one password and appear together after email sign-in; the same password also works with each project's ID. Projects without an email can sign in with their project ID. Existing projects can be linked to an email account from the project list without changing their project-ID passwords.
5. In the admin portal, add a construction start date to each project and add up to five photos or progress files (JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX, TXT, or CSV; 20 MB each) to an update. Admins can also create payment installments, configure Linier's four bank accounts, and review proofs alongside the account selected by the client for that installment, or estimate and send scope-change proposals for client approval. Clients choose an available bank account before uploading payment proof. Clients see the elapsed construction duration and can preview or download the uploaded photos.
6. Clients can request a project-password reset with a project ID or an email-account password reset with their email and WhatsApp number. Requests appear in the admin dashboard; verify the client and reset only the credential type requested, then send the new password through WhatsApp. Clients can also change the password for the credential they used to sign in.
7. Clients can submit project feedback from their portal. Admins and staff see the shared inbox in the admin portal, can reply there, and clients see the reply alongside their feedback.
8. Clients can review installment amounts and due dates, upload JPG/PNG/WEBP/PDF payment proofs (up to 5 MB), and track whether each proof is awaiting review, needs changes, or is paid. Admins must review proofs before marking an installment paid. Clients can submit scope-change requests and approve or reject studio proposals showing cost and schedule impacts.
9. Share the deployed site's URL with `#/portal` appended and the client's project ID and account password through a separate secure channel. For projects created now, that one password works with either the project ID or client email. If an admin forgets their password, update `PORTAL_ADMIN_PASSWORD` in Vercel Environment Variables and redeploy.

Client passwords are stored as salted scrypt hashes. API sessions use an HttpOnly, SameSite cookie; the Supabase service role key remains on the server. Client login attempts are limited to 10 per project per 15 minutes.
