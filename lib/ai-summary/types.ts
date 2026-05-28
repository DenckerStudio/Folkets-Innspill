export type SummaryField = 'hva' | 'hvem' | 'kostnad';

export type SummaryCards = Record<SummaryField, string>;

export type PartialSummaryCards = Partial<SummaryCards>;

export interface SakContext {
  issueId: string;
  title: string;
  summary: string;
  category?: string;
  innstillingstekst?: string;
  kortvedtak?: string;
  vedtakstekst?: string;
  parentestekst?: string;
}

export interface FieldValidationResult {
  field: SummaryField;
  approved: boolean;
  score: number;
  feedback: string;
  missingAspects: string[];
}

export interface FieldStatus {
  approved: boolean;
  score?: number;
}

export interface CachedFieldsResult {
  summaries: PartialSummaryCards;
  approvedFields: SummaryField[];
  contextHash: string | null;
}

export interface ApprovedSummaryRecord extends PartialSummaryCards {
  stortinget_issue_id: string;
  context_hash: string;
  approved_at?: string;
  hva_approved_at?: string | null;
  hvem_approved_at?: string | null;
  kostnad_approved_at?: string | null;
}

export const SUMMARY_FIELDS: SummaryField[] = ['hva', 'hvem', 'kostnad'];

export const MAX_VALIDATION_ATTEMPTS = 4;

export const FIELD_APPROVED_AT_COLUMN: Record<
  SummaryField,
  'hva_approved_at' | 'hvem_approved_at' | 'kostnad_approved_at'
> = {
  hva: 'hva_approved_at',
  hvem: 'hvem_approved_at',
  kostnad: 'kostnad_approved_at',
};

export function isFieldApproved(
  field: SummaryField,
  approvedFields: SummaryField[]
): boolean {
  return approvedFields.includes(field);
}

export function missingSummaryFields(
  summaries: PartialSummaryCards,
  approvedFields: SummaryField[]
): SummaryField[] {
  return SUMMARY_FIELDS.filter(
    (f) => !isFieldApproved(f, approvedFields) || !summaries[f]?.trim()
  );
}

export function allSummaryFieldsApproved(
  approvedFields: SummaryField[]
): boolean {
  return SUMMARY_FIELDS.every((f) => isFieldApproved(f, approvedFields));
}
