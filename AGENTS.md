# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Folkets Stemme** ("The People's Voice") is a Norwegian civic engagement platform built as a single **Next.js 15 App Router** application. It fetches live data from the Norwegian Parliament's open API (`data.stortinget.no`) and lets citizens browse parliamentary cases, vote on issues, participate in forum discussions, and engage with hearings.

### Architecture

- **Auth**: Supabase Auth (email/password, Google OAuth, SMS OTP) — configured via Supabase Dashboard
- **Database**: Supabase (PostgreSQL) with the `next_auth` schema for user management and `public` schema for domain tables
- **External API**: Norwegian Parliament open data API (`data.stortinget.no`) — public, no auth required
- **AI**: Issue summaries use the **Vercel AI SDK** (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`): Gemini when `GEMINI_API_KEY` is set, or Ollama via OpenAI-compatible `OLLAMA_URL` (see `lib/ai-summary/provider.ts`)

### Running the app

- **Dev server**: `npm run dev` (starts on `http://localhost:3000`)
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- See `package.json` scripts for the full list.

### Key caveats

- **Supabase secrets required for full functionality**: Without `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`, the app starts but shows empty data for votes, forum, and hearings. The Stortinget API data (issues, representatives) still works.
- **OAuth configured in Supabase Dashboard**: Google (and other providers) are enabled via Supabase Dashboard → Authentication → Providers. The OAuth callback URL is `/api/auth/callback`.
- **Middleware refreshes auth tokens**: `middleware.ts` runs on every request to refresh Supabase auth cookies via `@supabase/ssr`.
- **Build warning on `/horinger`**: The `/horinger` route fetches from its own API at build time, causing a non-fatal `DYNAMIC_SERVER_USAGE` error. This is expected.
- **No automated test suite**: Validation is done via lint, build, and manual testing.
- **Voting schema**: SQL migrations live in `supabase/migrations/`. Run `supabase db push` (or paste SQL in the dashboard) before vote APIs work. Ballots are in `citizen_votes` (no `user_id`); per-user choices are encrypted in `user_vote_receipts` via `pgcrypto`.
- **GEMINI_API_KEY or OLLAMA_URL**: At least one is required for AI summaries; without either, generation fails and the API returns 503.
- **AI summaries (`issue_ai_summaries`)**: Three cards with fixed roles (`sakens-kjerne`, `for-vanlige-folk`, `konkret-fra-kilden`): deep substance, citizen impact, and a distinct source detail — no repeated titles/bodies. Ollama generates **one card per API call** to reduce gateway timeouts; batch fallback uses `fallback-cards.ts`. `card-quality.ts` rejects repetition and placeholders. API: `GET /api/sak/[id]/ai-summary` (`maxDuration` 300s). Force regenerate: `POST { "force": true }`.
- **AI summary modules**: `lib/ai-summary/` — `service.ts`, `pipeline.ts`, `provider.ts`, `schemas.ts`, `context.ts`, `documents.ts`, `prompts.ts`, `card-quality.ts`, `hvem-quality.ts`.
- **AI summary manual test**: (1) First `GET` on a sak → dynamic card titles (not fixed Hva/Hvem/Kostnad). (2) Second `GET` with unchanged source → `cached: true`. (3) `POST { "force": true }` deletes `issue_ai_summaries` row and reruns pipeline. (4) Sak `200083`: any «hvem»/berørte-grupper card must describe who is affected, not forslagstillere or komité.
