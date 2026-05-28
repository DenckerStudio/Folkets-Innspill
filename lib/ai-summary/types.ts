export interface SummaryCard {
  id: string;
  title: string;
  hint?: string;
  body: string;
}

export interface CardStatus {
  approved: boolean;
  score?: number;
  feedback?: string;
  lastAttempt?: string;
}

export interface StoredCardsPayload {
  cards: SummaryCard[];
  approvedCardIds: string[];
}

export interface SakContext {
  issueId: string;
  title: string;
  summary: string;
  category?: string;
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
}

export interface CachedCardsResult {
  cards: SummaryCard[];
  approvedCardIds: string[];
  contextHash: string | null;
}

export interface CardValidationResult {
  cardId: string;
  approved: boolean;
  score: number;
  feedback: string;
  missingAspects: string[];
  suggestedRevision?: string;
}

export const MAX_CARD_VALIDATION_ATTEMPTS = 3;

export function allCardsApproved(
  cards: SummaryCard[],
  approvedCardIds: string[]
): boolean {
  if (cards.length === 0) return false;
  const approved = new Set(approvedCardIds);
  return cards.every((c) => approved.has(c.id));
}

export function pendingCardIds(
  cards: SummaryCard[],
  approvedCardIds: string[]
): string[] {
  const approved = new Set(approvedCardIds);
  return cards.filter((c) => !approved.has(c.id)).map((c) => c.id);
}
