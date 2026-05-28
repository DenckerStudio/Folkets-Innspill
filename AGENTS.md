# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Folkets Stemme** ("The People's Voice") is a Norwegian civic engagement platform built as a single **Next.js 15 App Router** application. It fetches live data from the Norwegian Parliament's open API (`data.stortinget.no`) and lets citizens browse parliamentary cases, vote on issues, participate in forum discussions, and engage with hearings.

### Architecture

- **Auth**: Supabase Auth (email/password, Google OAuth, SMS OTP) — configured via Supabase Dashboard
- **Database**: Supabase (PostgreSQL) with the `next_auth` schema for user management and `public` schema for domain tables
- **External API**: Norwegian Parliament open data API (`data.stortinget.no`) — public, no auth required
- **AI**: Optional Google Gemini API (`@google/genai`) for issue summaries

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
- **GEMINI_API_KEY is optional**: Without it and without `OLLAMA_URL`, AI summaries show a fallback message.
- **AI summaries (`issue_ai_summaries`)**: Approved hva/hvem/kostnad cards are cached in Supabase after validation against the Stortinget source text. Run `supabase/migrations/20260528120000_issue_ai_summaries.sql` on the database. API: `GET /api/sak/[id]/ai-summary`.
