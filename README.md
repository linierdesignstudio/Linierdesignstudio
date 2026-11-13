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

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor.
2. Add these environment variables to Vercel (and to `.env.local` when using `vercel dev`):
   - `SUPABASE_URL` — the Supabase project URL.
   - `SUPABASE_SERVICE_ROLE_KEY` — the server-only service role key. Never expose it with a `VITE_` prefix or commit it.
   - `PORTAL_SESSION_SECRET` — a random secret of at least 32 characters.
   - `PORTAL_ADMIN_PASSWORD` — a unique admin password of at least 16 characters.
3. Deploy to Vercel or run `vercel dev`. `npm run dev` alone does not run the API functions.
4. Open the deployed site's URL with `#/portal/admin` appended to sign in, create project IDs and client passwords, and post daily progress updates.
5. Share the deployed site's URL with `#/portal` appended, plus the generated project ID/password, through a separate secure channel.

Client passwords are stored as salted scrypt hashes. API sessions use an HttpOnly, SameSite cookie; the Supabase service role key remains on the server. Client login attempts are limited to 10 per project per 15 minutes.
