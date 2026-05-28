import { createHash } from 'crypto';
import { getSakDetail } from '@/lib/stortinget';
import { fetchSakDocuments } from './documents';
import type { SakContext } from './types';

const MAX_CONTEXT_CHARS = 12_000;
const OLLAMA_CONTEXT_CHARS = 6_500;

export function buildSakContextText(
  ctx: SakContext,
  options?: { maxChars?: number }
): string {
  const limit = options?.maxChars ?? MAX_CONTEXT_CHARS;
  const parts = [
    `Sak ID: ${ctx.issueId}`,
    ctx.sakTypeLabel ? `Sakstype: ${ctx.sakTypeLabel}` : null,
    ctx.category ? `Emne: ${ctx.category}` : null,
    `Tittel: ${ctx.title}`,
    `Kort beskrivelse: ${ctx.summary}`,
    ctx.innstillingstekst ? `Innstillingstekst:\n${ctx.innstillingstekst}` : null,
    ctx.kortvedtak ? `Kortvedtak:\n${ctx.kortvedtak}` : null,
    ctx.vedtakstekst ? `Vedtakstekst:\n${ctx.vedtakstekst}` : null,
    ctx.parentestekst ? `Parentestekst:\n${ctx.parentestekst}` : null,
    ctx.documentExcerpts
      ? `Tilknyttede dokumenter (utdrag):\n${ctx.documentExcerpts}`
      : null,
    ctx.publikasjonTitles?.length
      ? `Dokumentreferanser: ${ctx.publikasjonTitles.join('; ')}`
      : null,
    ctx.komite
      ? `Saksprosess – komité (ikke svar på «hvem påvirkes»): ${ctx.komite}`
      : null,
    ctx.forslagstillere?.length
      ? `Saksprosess – forslagstillere (ikke svar på «hvem påvirkes»): ${ctx.forslagstillere.map((f) => f.navn).filter(Boolean).join(', ')}`
      : null,
  ].filter(Boolean);

  let text = parts.join('\n\n');
  if (text.length > limit) {
    text = `${text.slice(0, limit)}\n\n[... teksten er avkortet for AI-behandling ...]`;
  }
  return text;
}

export function buildSakContextTextForModel(ctx: SakContext): string {
  const useOllama = Boolean(
    process.env.OLLAMA_URL || process.env.NEXT_PUBLIC_OLLAMA_URL
  );
  return buildSakContextText(
    ctx,
    useOllama ? { maxChars: OLLAMA_CONTEXT_CHARS } : undefined
  );
}

export function hashSakContext(ctx: SakContext): string {
  return createHash('sha256').update(buildSakContextText(ctx)).digest('hex');
}

export async function fetchDetailedSak(issueId: string): Promise<{
  innstillingstekst?: string;
  kortvedtak?: string;
  vedtakstekst?: string;
  parentestekst?: string;
  sakType?: number;
  sakTypeLabel?: string;
  documentExcerpts?: string;
  publikasjonTitles?: string[];
  forslagstillere?: Array<{ navn?: string }>;
  komite?: string;
}> {
  const detail = await getSakDetail(issueId, { nextRevalidateSeconds: 3600 });
  const docBundle = await fetchSakDocuments(issueId, detail);

  if (!detail) {
    return docBundle;
  }

  return {
    innstillingstekst: detail.innstillingstekst ?? undefined,
    kortvedtak: detail.kortvedtak ?? undefined,
    vedtakstekst: detail.vedtakstekst ?? undefined,
    parentestekst: detail.parentestekst ?? undefined,
    ...docBundle,
  };
}
