export type SummaryField = 'hva' | 'hvem' | 'kostnad';

export type SummaryCards = Record<SummaryField, string>;

export interface SakContext {
  issueId: string;
  title: string;
  summary: string;
  category?: string;
  innstillingstekst?: string;
  kortvedtak?: string;
  vedtakstekst?: string;
}

export interface FieldValidationResult {
  field: SummaryField;
  approved: boolean;
  score: number;
  feedback: string;
  missingAspects: string[];
}

export interface ApprovedSummaryRecord extends SummaryCards {
  stortinget_issue_id: string;
  context_hash: string;
  approved_at: string;
}

export const SUMMARY_FIELDS: SummaryField[] = ['hva', 'hvem', 'kostnad'];

export const MAX_VALIDATION_ATTEMPTS = 3;
