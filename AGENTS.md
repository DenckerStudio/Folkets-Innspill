# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Folkets Stemme** ("The People's Voice") is a Norwegian civic engagement platform built as a single **Next.js 15 App Router** application. It fetches live data from the Norwegian Parliament's open API (`data.stortinget.no`) and lets citizens browse parliamentary cases, vote on issues, participate in forum discussions, and engage with hearings.

### Architecture

- **Auth**: Supabase Auth (email/password, Google OAuth, SMS OTP) — configured via Supabase Dashboard
- **Database**: Supabase (PostgreSQL) with the `next_auth` schema for user management and `public` schema for domain tables
- **External API**: Norwegian Parliament open data API (`data.stortinget.no`) — public, no auth required
- **AI summaries**: Generated only by **n8n + Ollama** into `issue_ai_summaries`; the app reads from Supabase and triggers n8n via webhook (see Key caveats)

### Running the app

- **Dev server**: `npm run dev` (starts on `http://localhost:3000`)
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- See `package.json` scripts for the full list.

### Key caveats

- **Supabase secrets required for full functionality**: Without `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`, the app starts but shows empty data for votes, forum, and hearings. The Stortinget API data (issues, representatives) still works.
- **OAuth configured in Supabase Dashboard**: Google (and other providers) are enabled via Supabase Dashboard → Authentication → Providers. The OAuth callback URL is `/api/auth/callback`.
- **Middleware refreshes auth tokens**: `middleware.ts` runs on every request to refresh Supabase auth cookies via `@supabase/ssr`.
- **Routes**: Public landing at `/` (10 popular issues). App pages live under `/dashboard/*` (utforsk, min-side, høringer, forum, etc.). Legacy paths redirect to `/dashboard/...`. `/dashboard/sak/[id]` is public for landing links; other dashboard routes require login (middleware).
- **Build warning on `/dashboard/horinger`**: The høringer route fetches from its own API at build time, causing a non-fatal `DYNAMIC_SERVER_USAGE` error. This is expected.
- **No automated test suite**: Validation is done via lint, build, and manual testing.
- **Voting schema**: SQL migrations live in `supabase/migrations/`. Run `supabase db push` (or paste SQL in the dashboard) before vote APIs work. Ballots are in `citizen_votes` (no `user_id`); per-user choices are encrypted in `user_vote_receipts` via `pgcrypto`.
- **AI summaries (`issue_ai_summaries`)**: Columns `hva`, `hvem`, `kostnad` per `stortinget_issue_id`. Migrations: `20260528120000_issue_ai_summaries.sql`, `20260529120000_simplify_issue_ai_summaries.sql` (drops `context_hash`, `approved_at`, and mirror columns on `stortinget_issues`). App: `lib/ai-summary/service.ts`, `GET /api/sak/[id]/ai-summary` returns DB row or `202 pending` and triggers n8n — no in-app LLM or quality loop.
- **n8n backfill**: Workflow «Folkets Stemme – AI-sammendrag backfill» (ID `GP666Zq84qc19tcE`) — https://n8n.heyklever.app/workflow/GP666Zq84qc19tcE. Source: `workflows/n8n/ai-summary-backfill.workflow.ts`, docs: `workflows/n8n/README.md`. Every 10 min (and webhook): Postgres → Ollama agent → upsert `issue_ai_summaries`. Credentials: **Ollama Heyklever**, **Supabase Postgres Folkets**.
- **N8N_AI_SUMMARY_WEBHOOK_URL**: e.g. `https://n8n.heyklever.app/webhook/folkets-ai-summary`. `lib/trigger-ai-summary-webhook.ts` (5s abort, fire-and-forget) from sak sync and `GET` when summary missing. Body: `{ "stortinget_issue_id" }`.
- **n8n blocks `$env` in node expressions**: Set `batchLimit` in **Backfill settings** Set nodes, not env vars.
