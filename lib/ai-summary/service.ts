import { getServiceSupabase } from '@/lib/supabase';
import { getSak } from '@/lib/stortinget';
import { cardsAreRepetitive, isLowValueCard } from './card-quality';
import { buildSakContextText, fetchDetailedSak, hashSakContext } from './context';
import { runCardsApprovalPipeline } from './pipeline';
import type {
  CachedCardsResult,
  CardStatus,
  CardValidationResult,
  SakContext,
  StoredCardsPayload,
  SummaryCard,
} from './types';
import {
  allCardsApproved,
  pendingCardIds,
} from './types';

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function buildSakContext(issueId: string): Promise<SakContext | null> {
  const sak = await getSak(issueId);
  if (!sak) return null;

  const detail = await fetchDetailedSak(issueId);

  return {
    issueId,
    title: sak.title,
    summary: sak.summary,
    category: sak.category,
    ...detail,
  };
}

type DbCardsRow = {
  cards_json: StoredCardsPayload | null;
  context_hash: string;
  cards_approved_at: string | null;
};

function parseStoredCards(
  row: DbCardsRow,
  contextHash: string
): CachedCardsResult {
  if (row.context_hash !== contextHash || !row.cards_json?.cards?.length) {
    return { cards: [], approvedCardIds: [], contextHash: null };
  }

  return {
    cards: row.cards_json.cards,
    approvedCardIds: row.cards_json.approvedCardIds ?? [],
    contextHash: row.context_hash,
  };
}

export async function getCachedCards(
  issueId: string,
  contextHash: string
): Promise<CachedCardsResult> {
  if (!supabaseConfigured()) {
    return { cards: [], approvedCardIds: [], contextHash: null };
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('issue_ai_summaries')
      .select('cards_json, context_hash, cards_approved_at')
      .eq('stortinget_issue_id', issueId)
      .maybeSingle();

    if (error || !data) {
      return { cards: [], approvedCardIds: [], contextHash: null };
    }

    const parsed = parseStoredCards(data as DbCardsRow, contextHash);
    if (parsed.cards.length > 0) {
      return parsed;
    }

    return { cards: [], approvedCardIds: [], contextHash: null };
  } catch (e) {
    console.error('[ai-summary] Kunne ikke hente kort-cache:', e);
    return { cards: [], approvedCardIds: [], contextHash: null };
  }
}

export async function saveCardsProgress(
  issueId: string,
  payload: StoredCardsPayload,
  contextHash: string,
  fullyApproved: boolean
): Promise<void> {
  if (!supabaseConfigured()) return;

  const supabase = getServiceSupabase();
  const now = new Date().toISOString();

  const row: Record<string, unknown> = {
    stortinget_issue_id: issueId,
    context_hash: contextHash,
    cards_json: payload,
    updated_at: now,
  };

  if (fullyApproved) {
    row.cards_approved_at = now;
    row.approved_at = now;
  }

  const { error } = await supabase.from('issue_ai_summaries').upsert(row, {
    onConflict: 'stortinget_issue_id',
  });

  if (error) {
    console.error('[ai-summary] Kunne ikke lagre kort:', error);
    return;
  }

  if (fullyApproved) {
    await supabase.from('stortinget_issues').upsert(
      {
        id: issueId,
        ai_summary_json: { cards: payload.cards },
        ai_summary_generated_at: now,
        last_synced_at: now,
      },
      { onConflict: 'id' }
    );
  }
}

export async function clearSummaryCache(issueId: string): Promise<void> {
  if (!supabaseConfigured()) return;

  const supabase = getServiceSupabase();
  await supabase.from('issue_ai_summaries').delete().eq('stortinget_issue_id', issueId);
}

export interface AiSummaryResponse {
  cards: SummaryCard[];
  cached: boolean;
  allApproved: boolean;
  pendingCardIds: string[];
  cardStatus: Record<string, CardStatus>;
}

function buildCardStatusMap(
  cards: SummaryCard[],
  approvedCardIds: string[],
  validations: CardValidationResult[]
): Record<string, CardStatus> {
  const latest = new Map<string, CardValidationResult>();
  for (const v of validations) {
    latest.set(v.cardId, v);
  }

  const approved = new Set(approvedCardIds);
  const status: Record<string, CardStatus> = {};

  for (const card of cards) {
    const v = latest.get(card.id);
    const isApproved = approved.has(card.id) || v?.approved === true;
    status[card.id] = {
      approved: isApproved,
      score: v?.score,
      feedback: isApproved ? undefined : v?.feedback,
      lastAttempt: isApproved ? undefined : card.body,
    };
  }

  return status;
}

function buildResponse(
  cards: SummaryCard[],
  approvedCardIds: string[],
  cached: boolean,
  validations: CardValidationResult[]
): AiSummaryResponse {
  const allApproved = allCardsApproved(cards, approvedCardIds);

  return {
    cards,
    cached,
    allApproved,
    pendingCardIds: pendingCardIds(cards, approvedCardIds),
    cardStatus: buildCardStatusMap(cards, approvedCardIds, validations),
  };
}

async function runPipeline(
  ctx: SakContext,
  cached: CachedCardsResult
): Promise<AiSummaryResponse> {
  const contextHash = hashSakContext(ctx);

  const cacheIsComplete =
    cached.cards.length > 0 &&
    allCardsApproved(cached.cards, cached.approvedCardIds);
  const cacheHasLowValue =
    cached.cards.some((c) => isLowValueCard(c, cached.cards)) ||
    cardsAreRepetitive(cached.cards);

  if (cacheIsComplete && !cacheHasLowValue) {
    return buildResponse(cached.cards, cached.approvedCardIds, true, []);
  }

  let cards = [...cached.cards];
  let approvedCardIds = cacheHasLowValue
    ? cached.approvedCardIds.filter(
        (id) =>
          !cached.cards.some((c) => c.id === id && isLowValueCard(c, cached.cards))
      )
    : [...cached.approvedCardIds];

  const { cards: finalCards, validations, approvedCardIds: finalApproved } =
    await runCardsApprovalPipeline(ctx, {
      initialCards: cards.length ? cards : undefined,
      approvedCardIds,
      onCardApproved: async (card) => {
        if (!approvedCardIds.includes(card.id)) {
          approvedCardIds.push(card.id);
        }
        const idx = cards.findIndex((c) => c.id === card.id);
        if (idx >= 0) cards[idx] = card;
        else cards.push(card);

        await saveCardsProgress(
          ctx.issueId,
          { cards, approvedCardIds },
          contextHash,
          allCardsApproved(cards, approvedCardIds)
        );
      },
    });

  cards = finalCards;
  approvedCardIds = finalApproved;

  await saveCardsProgress(
    ctx.issueId,
    { cards, approvedCardIds },
    contextHash,
    allCardsApproved(cards, approvedCardIds)
  );

  return buildResponse(cards, approvedCardIds, false, validations);
}

export async function getOrCreateApprovedAiSummary(
  issueId: string
): Promise<AiSummaryResponse | null> {
  const ctx = await buildSakContext(issueId);
  if (!ctx) return null;

  const contextHash = hashSakContext(ctx);
  const cached = await getCachedCards(issueId, contextHash);

  const cacheIsComplete =
    cached.cards.length > 0 &&
    allCardsApproved(cached.cards, cached.approvedCardIds);
  const cacheHasLowValue =
    cached.cards.some((c) => isLowValueCard(c, cached.cards)) ||
    cardsAreRepetitive(cached.cards);

  if (cacheIsComplete && !cacheHasLowValue) {
    return buildResponse(cached.cards, cached.approvedCardIds, true, []);
  }

  return runPipeline(ctx, cached);
}

export async function regenerateAiSummary(
  issueId: string
): Promise<AiSummaryResponse | null> {
  const ctx = await buildSakContext(issueId);
  if (!ctx) return null;

  await clearSummaryCache(issueId);
  return runPipeline(ctx, { cards: [], approvedCardIds: [], contextHash: null });
}

export { buildSakContextText };
