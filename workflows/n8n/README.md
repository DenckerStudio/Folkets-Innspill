# n8n – AI-sammendrag backfill (Ollama)

Workflow-kilde: [`ai-summary-backfill.workflow.ts`](ai-summary-backfill.workflow.ts)

**Live workflow:** https://n8n.heyklever.app/workflow/GP666Zq84qc19tcE

## Flyt

1. Hent `stortinget_issues` uten rad i `issue_ai_summaries` (schedule) eller via webhook + `id`
2. Bygg kontekst fra `title`, `summary`, `detail_json` (Code)
3. **AI Agent** med **Ollama Chat Model** → strukturert JSON (`hva`, `hvem`, `kostnad`)
4. Upsert til `issue_ai_summaries` (ingen speiling til `stortinget_issues`)

Appen genererer ikke sammendrag selv — den leser Supabase og poller `GET /api/sak/[id]/ai-summary` til rad finnes.

## Konfigurasjon i n8n

| Nøkkel | Hvor | Verdi |
|--------|------|--------|
| **Ollama credential** | «Ollama Heyklever» | Base URL: `https://ollama.heyklever.app` |
| **Modell** | Under «Ollama Chat Model» | f.eks. `llama3.2:3b-text-q4_K_M` |
| **batchLimit** | «Backfill settings (schedule)» | `1` (anbefalt) |
| **Postgres** | «Supabase Postgres Folkets» | Supabase connection string |

n8n blokkerer `$env` i noder — ikke bruk `$env` for app-URL her.

## Webhook fra appen

```bash
N8N_AI_SUMMARY_WEBHOOK_URL=https://n8n.heyklever.app/webhook/folkets-ai-summary
```

`lib/trigger-ai-summary-webhook.ts` kalles når sak synkes uten sammendrag, og fra `GET /api/sak/[id]/ai-summary` mens rad mangler.

## Triggere

| Trigger | Oppførsel |
|---------|-----------|
| **Every 10 minutes** | SQL → én sak → Ollama agent → lagre → 5 s pause |
| **Webhook POST** | `{ "stortinget_issue_id": "…" }` → hent sak → Ollama → lagre → JSON-svar |

## Test webhook

```bash
curl -X POST "$N8N_AI_SUMMARY_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"stortinget_issue_id":"200329"}'
```

## Supabase-skjema

Etter migrasjon `20260529120000_simplify_issue_ai_summaries.sql`:

| Beholdes | Fjernet |
|----------|---------|
| `issue_ai_summaries`: `stortinget_issue_id`, `hva`, `hvem`, `kostnad`, `created_at`, `updated_at` | `context_hash`, `approved_at`, `hva_approved_at`, `hvem_approved_at`, `kostnad_approved_at`, `cards_json`, `cards_approved_at` |
| — | `stortinget_issues.ai_summary_json`, `ai_summary_generated_at` |

Kjør `supabase db push` etter pull.

## Forum trending prompts

Workflow-kilde: [`forum-trending-prompts.workflow.ts`](forum-trending-prompts.workflow.ts)

**Live workflow:** https://n8n.heyklever.app/workflow/MloIdsnX7FozM4dv

1. **Fetch RSS headlines** (parallell HTTP + bilde/video fra RSS der tilgjengelig)
2. **Collect all headlines** (prioriterer politikk-relevante saker, SearXNG politikk-søk) → **Ollama** → `forum_prompts` med `source_headlines` (kilde-URL, outlet, imageUrl, videoUrl)
3. `sensitivity: high` → `draft` (godkjenn i `/dashboard/admin/forum-prompts`); `low` → `active` (7 dagers `expires_at`)
4. UI: horisontal «reel»-karusell med kilde-lenker og forhåndsvisning av bilde/video

Webhook: `POST /webhook/folkets-forum-prompts` (env `N8N_FORUM_PROMPTS_WEBHOOK_URL`).

Set `searxngBaseUrl` in **Backfill settings** Set node (not `$env`).

## Deploy fra repo

Valider og opprett via n8n-mcp: `validate_workflow` → `create_workflow_from_code` → `publish_workflow`.
