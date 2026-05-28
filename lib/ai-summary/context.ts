import { createHash } from 'crypto';
import { getSakDetail } from '@/lib/stortinget';
import type { SakContext } from './types';

const MAX_CONTEXT_CHARS = 12_000;

export function buildSakContextText(ctx: SakContext): string {
  const parts = [
    `Sak ID: ${ctx.issueId}`,
    ctx.category ? `Emne: ${ctx.category}` : null,
    `Tittel: ${ctx.title}`,
    `Kort beskrivelse: ${ctx.summary}`,
    ctx.innstillingstekst ? `Innstillingstekst:\n${ctx.innstillingstekst}` : null,
    ctx.kortvedtak ? `Kortvedtak:\n${ctx.kortvedtak}` : null,
    ctx.vedtakstekst ? `Vedtakstekst:\n${ctx.vedtakstekst}` : null,
    ctx.parentestekst ? `Parentestekst:\n${ctx.parentestekst}` : null,
  ].filter(Boolean);

  let text = parts.join('\n\n');
  if (text.length > MAX_CONTEXT_CHARS) {
    text = `${text.slice(0, MAX_CONTEXT_CHARS)}\n\n[... teksten er avkortet for AI-behandling ...]`;
  }
  return text;
}

export function hashSakContext(ctx: SakContext): string {
  return createHash('sha256').update(buildSakContextText(ctx)).digest('hex');
}

export async function fetchDetailedSak(issueId: string): Promise<{
  innstillingstekst?: string;
  kortvedtak?: string;
  vedtakstekst?: string;
  parentestekst?: string;
}> {
  const detail = await getSakDetail(issueId, { nextRevalidateSeconds: 3600 });
  if (!detail) return {};

  return {
    innstillingstekst: detail.innstillingstekst ?? undefined,
    kortvedtak: detail.kortvedtak ?? undefined,
    vedtakstekst: detail.vedtakstekst ?? undefined,
    parentestekst: detail.parentestekst ?? undefined,
  };
}
