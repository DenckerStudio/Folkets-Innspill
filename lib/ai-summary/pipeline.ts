import { generateText, Output } from 'ai';
import { SUMMARY_CARD_ROLES } from './card-roles';
import {
  applyQualityGuard,
  cardsAreRepetitive,
  heuristicValidateCard,
  isLowValueCard,
} from './card-quality';
import { buildFallbackCards } from './fallback-cards';
import { buildSakContextTextForModel } from './context';
import { isProposerOnlyHvemAnswer } from './hvem-quality';
import {
  getGenerateCallSettings,
  getSingleCardCallSettings,
  getSummaryLanguageModel,
  isUsingOllama,
} from './provider';
import {
  buildCardValidationPrompt,
  buildDynamicCardsPrompt,
  buildSingleCardRegenerationPrompt,
  buildSingleRoleCardPrompt,
} from './prompts';
import {
  cardValidationSchema,
  sakCardsGenerationSchema,
  singleCardSchema,
} from './schemas';
import type {
  CardValidationResult,
  SakContext,
  SummaryCard,
} from './types';
import { MAX_CARD_VALIDATION_ATTEMPTS } from './types';

const APPROVAL_SCORE_THRESHOLD = 70;

function isAffectedGroupsCard(card: SummaryCard): boolean {
  const label = `${card.id} ${card.title} ${card.hint ?? ''}`.toLowerCase();
  return /hvem|berør|rammes|påvirk|pasient|borgere|innbygg|næring|bransje/.test(
    label
  );
}

function applyProposerGuard(
  ctx: SakContext,
  card: SummaryCard,
  validation: CardValidationResult
): CardValidationResult {
  if (!isAffectedGroupsCard(card) || !isProposerOnlyHvemAnswer(card.body)) {
    return validation;
  }
  return {
    ...validation,
    approved: false,
    score: Math.min(validation.score, 35),
    feedback:
      'Kortet beskriver forslagstillere eller komité, ikke hvem som påvirkes av saken.',
    missingAspects: [
      ...validation.missingAspects,
      'Berørte grupper utenfor Stortinget',
    ],
  };
}

async function generateOneCard(
  ctx: SakContext,
  roleIndex: number,
  otherCards: SummaryCard[]
): Promise<SummaryCard> {
  const sakText = buildSakContextTextForModel(ctx);
  const role = SUMMARY_CARD_ROLES[roleIndex];
  const model = getSummaryLanguageModel();

  const { output } = await generateText({
    model,
    ...getSingleCardCallSettings(),
    output: Output.object({ schema: singleCardSchema }),
    prompt: buildSingleRoleCardPrompt(sakText, ctx, roleIndex, otherCards),
    temperature: 0.35,
  });

  return {
    id: role.id,
    title: output.card.title.trim(),
    hint: output.card.hint?.trim() ?? role.hint,
    body: output.card.body.trim(),
  };
}

/** Ett kort per kall – unngår gateway timeout på små Ollama-modeller. */
async function generateCardsSequentially(ctx: SakContext): Promise<SummaryCard[]> {
  const cards: SummaryCard[] = [];

  for (let i = 0; i < SUMMARY_CARD_ROLES.length; i += 1) {
    const card = await generateOneCard(ctx, i, cards);
    cards.push(card);
  }

  return cards;
}

export async function generateDynamicCards(ctx: SakContext): Promise<SummaryCard[]> {
  const sakText = buildSakContextTextForModel(ctx);
  const model = getSummaryLanguageModel();

  if (isUsingOllama()) {
    try {
      return await generateCardsSequentially(ctx);
    } catch (e) {
      console.warn(
        '[ai-summary] Sekvensiell generering feilet, bruker fallback:',
        e
      );
      return buildFallbackCards(ctx);
    }
  }

  try {
    const { output } = await generateText({
      model,
      ...getGenerateCallSettings(),
      output: Output.object({ schema: sakCardsGenerationSchema }),
      prompt: buildDynamicCardsPrompt(sakText, ctx, false),
      temperature: 0.3,
    });

    const cards = output.cards.map((c) => ({
      id: c.id,
      title: c.title.trim(),
      hint: c.hint?.trim(),
      body: c.body.trim(),
    }));

    if (cardsAreRepetitive(cards)) {
      return await generateCardsSequentially(ctx);
    }
    return cards;
  } catch (e) {
    console.warn('[ai-summary] Batch-generering feilet, prøver sekvensiell:', e);
    try {
      return await generateCardsSequentially(ctx);
    } catch (e2) {
      console.warn('[ai-summary] Sekvensiell generering feilet, bruker fallback:', e2);
      return buildFallbackCards(ctx);
    }
  }
}

export async function validateCard(
  ctx: SakContext,
  card: SummaryCard,
  siblings: SummaryCard[] = []
): Promise<CardValidationResult> {
  const sakText = buildSakContextTextForModel(ctx);
  const model = getSummaryLanguageModel();
  const others = siblings.filter((c) => c.id !== card.id);

  try {
    const { output } = await generateText({
      model,
      ...getGenerateCallSettings(),
      output: Output.object({ schema: cardValidationSchema }),
      prompt: buildCardValidationPrompt(sakText, ctx, card, others),
      temperature: 0.1,
    });

    const approved =
      output.approved === true && output.score >= APPROVAL_SCORE_THRESHOLD;

    let result: CardValidationResult = {
      cardId: card.id,
      approved,
      score: output.score,
      feedback: output.feedback?.trim() || 'Dekker ikke kilden godt nok.',
      missingAspects: output.missingAspects ?? [],
      suggestedRevision: output.suggestedRevision?.trim(),
    };

    result = applyProposerGuard(ctx, card, result);
    return applyQualityGuard(ctx, card, result, siblings);
  } catch (e) {
    console.warn(`[ai-summary] Validering av kort "${card.id}" feilet:`, e);
    return heuristicValidateCard(ctx, card, siblings);
  }
}

export async function regenerateCard(
  ctx: SakContext,
  card: SummaryCard,
  feedback: string,
  missingAspects: string[],
  suggestedRevision?: string,
  siblings: SummaryCard[] = []
): Promise<SummaryCard> {
  const sakText = buildSakContextTextForModel(ctx);
  const model = getSummaryLanguageModel();
  const others = siblings.filter((c) => c.id !== card.id);

  try {
    const { output } = await generateText({
      model,
      ...getSingleCardCallSettings(),
      output: Output.object({ schema: singleCardSchema }),
      prompt: buildSingleCardRegenerationPrompt(
        sakText,
        ctx,
        card,
        feedback,
        missingAspects,
        suggestedRevision,
        others
      ),
      temperature: 0.35,
    });

    return {
      id: card.id,
      title: output.card.title.trim(),
      hint: output.card.hint?.trim(),
      body: output.card.body.trim(),
    };
  } catch (e) {
    console.warn(`[ai-summary] regenerateCard "${card.id}" feilet:`, e);
    const fallbacks = buildFallbackCards(ctx);
    const match = fallbacks.find((c) => c.id === card.id) ?? fallbacks[0];
    return { ...match, id: card.id };
  }
}

export interface PipelineResult {
  cards: SummaryCard[];
  validations: CardValidationResult[];
  approvedCardIds: string[];
}

function validateForOllama(
  ctx: SakContext,
  card: SummaryCard,
  siblings: SummaryCard[]
): CardValidationResult {
  let result = heuristicValidateCard(ctx, card, siblings);
  result = applyProposerGuard(ctx, card, result);
  return applyQualityGuard(ctx, card, result, siblings);
}

export async function runCardsApprovalPipeline(
  ctx: SakContext,
  options: {
    initialCards?: SummaryCard[];
    approvedCardIds?: string[];
    onCardApproved?: (card: SummaryCard) => Promise<void>;
  } = {}
): Promise<PipelineResult> {
  let cards = options.initialCards?.length
    ? [...options.initialCards]
    : await generateDynamicCards(ctx);

  const skipLlmValidation = isUsingOllama();

  const approvedSet = new Set(options.approvedCardIds ?? []);

  const needsRegen =
    cards.some((c) => isLowValueCard(c, cards)) || cardsAreRepetitive(cards);

  if (needsRegen) {
    cards = await generateDynamicCards(ctx);
    approvedSet.clear();
  }

  const validations: CardValidationResult[] = [];

  for (let i = 0; i < cards.length; i += 1) {
    let card = cards[i];
    if (approvedSet.has(card.id)) continue;

    let attempts = 0;
    let accumulatedMissing: string[] = [];
    let lastSuggested: string | undefined;

    while (attempts < MAX_CARD_VALIDATION_ATTEMPTS) {
      const siblings = cards.map((c, idx) => (idx === i ? card : c));
      const validation = skipLlmValidation
        ? validateForOllama(ctx, card, siblings)
        : await validateCard(ctx, card, siblings);
      validations.push(validation);

      if (validation.approved) {
        approvedSet.add(card.id);
        cards[i] = card;
        if (options.onCardApproved) {
          await options.onCardApproved(card);
        }
        break;
      }

      attempts += 1;
      if (attempts >= MAX_CARD_VALIDATION_ATTEMPTS) {
        console.warn(
          `[ai-summary] Kort "${card.id}" for sak ${ctx.issueId} ikke godkjent etter ${MAX_CARD_VALIDATION_ATTEMPTS} forsøk`
        );
        break;
      }

      accumulatedMissing = [
        ...new Set([...accumulatedMissing, ...validation.missingAspects]),
      ];
      lastSuggested = validation.suggestedRevision ?? lastSuggested;

      card = await regenerateCard(
        ctx,
        card,
        validation.feedback,
        accumulatedMissing,
        lastSuggested,
        cards
      );
      cards[i] = card;
    }
  }

  const approvedIds = Array.from(approvedSet);
  let approvedCards = cards.filter((c) => approvedSet.has(c.id));

  if (approvedCards.length === 0) {
    const fallback = buildFallbackCards(ctx);
    if (!cardsAreRepetitive(fallback)) {
      console.warn(
        `[ai-summary] Ingen LLM-kort godkjent for sak ${ctx.issueId}; bruker forbedret fallback`
      );
      return {
        cards: fallback,
        validations,
        approvedCardIds: fallback.map((c) => c.id),
      };
    }
    return { cards: [], validations, approvedCardIds: [] };
  }

  if (cardsAreRepetitive(approvedCards)) {
    approvedCards = buildFallbackCards(ctx);
    return {
      cards: approvedCards,
      validations,
      approvedCardIds: approvedCards.map((c) => c.id),
    };
  }

  return {
    cards: approvedCards,
    validations,
    approvedCardIds: approvedIds,
  };
}
