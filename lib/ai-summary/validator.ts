import { buildSakContextText } from './context';
import { generateLlmJson } from './llm';
import {
  buildFieldRegenerationPrompt,
  buildInitialGenerationPrompt,
  buildValidationPrompt,
} from './prompts';
import type {
  FieldValidationResult,
  SakContext,
  SummaryCards,
  SummaryField,
} from './types';
import { MAX_VALIDATION_ATTEMPTS, SUMMARY_FIELDS } from './types';

const APPROVAL_SCORE_THRESHOLD = 70;

function isValidCards(value: unknown): value is SummaryCards {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return SUMMARY_FIELDS.every((f) => typeof obj[f] === 'string' && obj[f].trim().length > 0);
}

export async function generateInitialSummaries(
  ctx: SakContext
): Promise<SummaryCards> {
  const sakText = buildSakContextText(ctx);
  const prompt = buildInitialGenerationPrompt(sakText);
  const result = await generateLlmJson<Partial<SummaryCards>>(prompt);

  if (!isValidCards(result)) {
    throw new Error('AI returnerte ugyldig sammendrag-struktur');
  }

  return {
    hva: result.hva.trim(),
    hvem: result.hvem.trim(),
    kostnad: result.kostnad.trim(),
  };
}

export async function validateSummaryField(
  ctx: SakContext,
  field: SummaryField,
  value: string
): Promise<FieldValidationResult> {
  const sakText = buildSakContextText(ctx);
  const prompt = buildValidationPrompt(field, sakText, value);
  const result = await generateLlmJson<{
    approved?: boolean;
    score?: number;
    feedback?: string;
    missingAspects?: string[];
  }>(prompt);

  const score = typeof result.score === 'number' ? result.score : 0;
  const approved =
    result.approved === true && score >= APPROVAL_SCORE_THRESHOLD;

  return {
    field,
    approved,
    score,
    feedback: result.feedback?.trim() || 'Teksten dekker ikke saken godt nok.',
    missingAspects: Array.isArray(result.missingAspects)
      ? result.missingAspects.filter((x) => typeof x === 'string')
      : [],
  };
}

export async function regenerateSummaryField(
  ctx: SakContext,
  field: SummaryField,
  current: SummaryCards,
  validation: FieldValidationResult
): Promise<string> {
  const sakText = buildSakContextText(ctx);
  const prompt = buildFieldRegenerationPrompt(
    field,
    sakText,
    current,
    validation.feedback,
    validation.missingAspects
  );
  const result = await generateLlmJson<Partial<Record<SummaryField, string>>>(prompt);
  const next = result[field]?.trim();
  if (!next) {
    throw new Error(`AI returnerte ikke feltet "${field}"`);
  }
  return next;
}

/**
 * Itererer over hva, hvem og kostnad: validerer mot stortingssaken,
 * regenererer felt som ikke godkjennes, inntil godkjent eller max forsøk.
 */
export async function iterateAndApproveSummaries(
  ctx: SakContext,
  initial?: SummaryCards
): Promise<{ summaries: SummaryCards; validations: FieldValidationResult[] }> {
  const summaries = initial ?? (await generateInitialSummaries(ctx));
  const validations: FieldValidationResult[] = [];

  for (const field of SUMMARY_FIELDS) {
    let attempts = 0;
    let validation: FieldValidationResult;

    do {
      validation = await validateSummaryField(ctx, field, summaries[field]);
      validations.push(validation);

      if (validation.approved) break;

      attempts += 1;
      if (attempts >= MAX_VALIDATION_ATTEMPTS) {
        console.warn(
          `[ai-summary] Felt "${field}" for sak ${ctx.issueId} ikke godkjent etter ${MAX_VALIDATION_ATTEMPTS} forsøk`
        );
        break;
      }

      summaries[field] = await regenerateSummaryField(
        ctx,
        field,
        summaries,
        validation
      );
    } while (attempts < MAX_VALIDATION_ATTEMPTS);
  }

  return { summaries, validations };
}

export function allFieldsApproved(validations: FieldValidationResult[]): boolean {
  const latestByField = new Map<SummaryField, FieldValidationResult>();
  for (const v of validations) {
    latestByField.set(v.field, v);
  }
  return SUMMARY_FIELDS.every((f) => latestByField.get(f)?.approved === true);
}
