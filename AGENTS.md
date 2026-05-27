# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Folkets Stemme** ("The People's Voice") is a Norwegian civic engagement platform built as a single **Next.js 15 App Router** application. It fetches live data from the Norwegian Parliament's open API (`data.stortinget.no`) and lets citizens browse parliamentary cases, vote on issues, participate in forum discussions, and engage with hearings.

### Architecture

- **Auth**: Better-auth with email/password, Google OAuth, Reddit OAuth, and SMS phone verification
- **Database**: Supabase (PostgreSQL) with the `next_auth` schema for user management and `public` schema for domain tables
- **External API**: Norwegian Parliament open data API (`data.stortinget.no`) — public, no auth required
- **AI**: Optional Google Gemini API (`@google/genai`) for issue summaries

### Running the app

- **Dev server**: `npm run dev` (starts on `http://localhost:3000`)
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- See `package.json` scripts for the full list.

### Key caveats

- **Supabase secrets required for full functionality**: Without `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL`, the app starts but shows empty data for votes, forum, and hearings. The Stortinget API data (issues, representatives) still works.
- **OAuth providers need credentials**: Google and Reddit OAuth buttons appear on the login page but require `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` and `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET` to function. Email/password auth works without OAuth credentials.
- **SMS verification is optional**: Without a configured SMS provider (`SMS_PROVIDER=twilio`), OTP codes are logged to the server console. Users can skip phone verification.
- **`BETTER_AUTH_API_KEY`**: Used as the Better-auth secret for session signing. Passed explicitly via the `secret` config option in `lib/auth.ts`.
- **Better-auth auto-creates tables**: On first connection to PostgreSQL, Better-auth will create its `user`, `session`, `account`, and `verification` tables in the `public` schema. The `databaseHooks.user.create.after` hook syncs new users to `next_auth.users` for domain table compatibility.
- **Build warning on `/horinger`**: The `/horinger` route fetches from its own API at build time, causing a non-fatal `DYNAMIC_SERVER_USAGE` error. This is expected.
- **No automated test suite**: Validation is done via lint, build, and manual testing.
- **GEMINI_API_KEY is optional**: Without it, AI summaries show a fallback message.
