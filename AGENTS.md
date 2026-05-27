# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**Folkets Stemme** ("The People's Voice") is a Norwegian civic engagement platform built as a single **Next.js 15 App Router** application. It fetches live data from the Norwegian Parliament's open API (`data.stortinget.no`) and lets citizens browse parliamentary cases, vote on issues, and explore politicians/parties.

### Running the app

- **Dev server**: `npm run dev` (starts on `http://localhost:3000`)
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- See `package.json` scripts for the full list.

### Key caveats

- **No database required**: Auth and voting are mocked. `better-sqlite3` is a declared dependency but no SQLite DB or schema exists. Voting is logged to console only.
- **No external services required besides Stortinget API**: The Norwegian Parliament API at `data.stortinget.no` is public and requires no authentication. Almost every page depends on it.
- **GEMINI_API_KEY is optional**: Without it, AI summaries on issue detail pages (`/sak/[id]`) show a fallback message. The rest of the app works fine.
- **`.env.local` setup**: Copy `.env.example` to `.env.local`. No secrets are required for basic functionality.
- **Build warning on `/horinger`**: The `/horinger` route fetches from its own API at build time (`localhost:3000/api/horinger` with `revalidate: 0`), which causes a non-fatal `DYNAMIC_SERVER_USAGE` error during `npm run build`. This is expected and does not block the build.
- **No automated test suite**: The project has no test framework or test files configured. Validation is done via lint, build, and manual testing.
