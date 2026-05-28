import { buildSakContextText } from './context';
import { generateLlmJson } from './llm';
import {
  buildFieldRegenerationPrompt,
  buildInitialGenerationPrompt,
  buildValidationPrompt,
} from './prompts';
import type {
  FieldValidationResult,
  PartialSummaryCards,
  SakContext,
  SummaryCards,
  SummaryField,
} from './types';
import {
  MAX_VALIDATION_ATTEMPTS,
  missingSummaryFields,
  SUMMARY_FIELDS,
} from './types';

const APPROVAL_SCORE_THRESHOLD = 70;

function isValidCards(value: unknown): value is SummaryCards {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return SUMMARY_FIELDS.every((f) => typeof obj[f] === 'string' && obj[f].trim().length > 0);
}

function mergeSummaries(
  base: PartialSummaryCards,
  patch: PartialSummaryCards
): SummaryCards {
  return {
    hva: (patch.hva ?? base.hva ?? '').trim(),
    hvem: (patch.hvem ?? base.hvem ?? '').trim(),
    kostnad: (patch.kostnad ?? base.kostnad ?? '').trim(),
  };
}

function accumulateFeedback(
  previous: string[],
  validation: FieldValidationResult
): { feedback: string; missingAspects: string[] } {
  const missingSet = new Set(previous);
  for (const aspect of validation.missingAspects) {
    missingSet.add(aspect);
  }
  const missingAspects = Array.from(missingSet);
  const parts = [validation.feedback, ...missingAspects].filter(Boolean);
  return {
    feedback: parts.join(' '),
    missingAspects,
  };
}

export async function generateInitialSummaries(
  ctx: SakContext,
  fields?: SummaryField[]
): Promise<PartialSummaryCards> {
  const sakText = buildSakContextText(ctx);
  const prompt = buildInitialGenerationPrompt(sakText);
  const result = await generateLlmJson<Partial<SummaryCards>>(prompt);

  if (!result || typeof result !== 'object') {
    throw new Error('AI returnerte ugyldig sammendrag-struktur');
  }

  const targetFields = fields ?? SUMMARY_FIELDS;
  const out: PartialSummaryCards = {};
  for (const field of targetFields) {
    const text = result[field]?.trim();
    if (text) out[field] = text;
  }

  if (targetFields.length === SUMMARY_FIELDS.length && !isValidCards(mergeSummaries({}, out))) {
    throw new Error('AI returnerte ugyldig sammendrag-struktur');
  }

  return out;
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
  feedback: string,
  missingAspects: string[]
): Promise<string> {
  const sakText = buildSakContextText(ctx);
  const prompt = buildFieldRegenerationPrompt(
    field,
    sakText,
    current,
    feedback,
    missingAspects
  );
  const result = await generateLlmJson<Partial<Record<SummaryField, string>>>(prompt);
  const next = result[field]?.trim();
  if (!next) {
    throw new Error(`AI returnerte ikke feltet "${field}"`);
  }
  return next;
}

export interface IterateOptions {
  initial?: PartialSummaryCards;
  approvedFields?: SummaryField[];
  fieldsToProcess?: SummaryField[];
  onFieldApproved?: (
    field: SummaryField,
    value: string,
    validation: FieldValidationResult
  ) => Promise<void>;
}

/**
 * Itererer over hva, hvem og kostnad: validerer mot stortingssaken,
 * regenererer felt som ikke godkjennes, inntil godkjent eller max forsøk.
 */
export async function iterateAndApproveSummaries(
  ctx: SakContext,
  options: IterateOptions = {}
): Promise<{
  summaries: SummaryCards;
  validations: FieldValidationResult[];
  newlyApprovedFields: SummaryField[];
}> {
  const approvedFields = new Set(options.approvedFields ?? []);
  let summaries = mergeSummaries(options.initial ?? {}, {});

  const fieldsToProcess =
    options.fieldsToProcess ??
    missingSummaryFields(summaries, Array.from(approvedFields));

  if (fieldsToProcess.length === 0) {
    return {
      summaries,
      validations: [],
      newlyApprovedFields: [],
    };
  }

  const needsGeneration = fieldsToProcess.some((f) => !summaries[f]?.trim());
  if (needsGeneration) {
    const generated = await generateInitialSummaries(ctx, fieldsToProcess);
    summaries = mergeSummaries(summaries, generated);
  }

  const validations: FieldValidationResult[] = [];
  const newlyApprovedFields: SummaryField[] = [];

  for (const field of fieldsToProcess) {
    if (approvedFields.has(field)) continue;

    let attempts = 0;
    let accumulatedMissing: string[] = [];
    let validation: FieldValidationResult;

    do {
      validation = await validateSummaryField(ctx, field, summaries[field]);
      validations.push(validation);

      if (validation.approved) {
        approvedFields.add(field);
        newlyApprovedFields.push(field);
        if (options.onFieldApproved) {
          await options.onFieldApproved(field, summaries[field], validation);
        }
        break;
      }

      attempts += 1;
      if (attempts >= MAX_VALIDATION_ATTEMPTS) {
        console.warn(
          `[ai-summary] Felt "${field}" for sak ${ctx.issueId} ikke godkjent etter ${MAX_VALIDATION_ATTEMPTS} forsøk`
        );
        break;
      }

      const accumulated = accumulateFeedback(accumulatedMissing, validation);
      accumulatedMissing = accumulated.missingAspects;

      summaries[field] = await regenerateSummaryField(
        ctx,
        field,
        summaries,
        accumulated.feedback,
        accumulated.missingAspects
      );
    } while (attempts < MAX_VALIDATION_ATTEMPTS);
  }

  return { summaries, validations, newlyApprovedFields };
}

export function allFieldsApproved(validations: FieldValidationResult[]): boolean {
  const latestByField = new Map<SummaryField, FieldValidationResult>();
  for (const v of validations) {
    latestByField.set(v.field, v);
  }
  return SUMMARY_FIELDS.every((f) => latestByField.get(f)?.approved === true);
}

export function buildFieldStatusMap(
  validations: FieldValidationResult[],
  approvedFields: SummaryField[]
): Record<SummaryField, { approved: boolean; score?: number }> {
  const latestByField = new Map<SummaryField, FieldValidationResult>();
  for (const v of validations) {
    latestByField.set(v.field, v);
  }

  return {
    hva: {
      approved: approvedFields.includes('hva') || latestByField.get('hva')?.approved === true,
      score: latestByField.get('hva')?.score,
    },
    hvem: {
      approved: approvedFields.includes('hvem') || latestByField.get('hvem')?.approved === true,
      score: latestByField.get('hvem')?.score,
    },
    kostnad: {
      approved:
        approvedFields.includes('kostnad') ||
        latestByField.get('kostnad')?.approved === true,
      score: latestByField.get('kostnad')?.score,
    },
  };
}
