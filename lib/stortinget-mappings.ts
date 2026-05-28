/** Numeric status codes from /eksport/saker (see Stortinget teknisk dokumentasjon §4.16). */
export const SAK_STATUS_LABELS: Record<number, string> = {
  1: 'varslet',
  2: 'mottatt',
  3: 'til_behandling',
  4: 'behandlet',
  5: 'trukket',
  6: 'bortfalt',
};

export const SAK_TYPE_LABELS: Record<number, string> = {
  1: 'lovsak',
  2: 'alminneligsak',
  3: 'budsjett',
};

export const SAK_DOKUMENTGRUPPE_LABELS: Record<number, string> = {
  0: 'ikke_spesifisert',
  1: 'proposisjon',
  2: 'melding',
  3: 'redegjoerelse',
  4: 'representantforslag',
  5: 'dokumentserien',
  6: 'innstillingssaker',
  7: 'innberetning',
  8: 'interpellasjon',
};

export function sakStatusLabel(status: number | string | undefined): string {
  if (status == null) return 'ukjent';
  if (typeof status === 'string') return status;
  return SAK_STATUS_LABELS[status] ?? `status_${status}`;
}

export function isSakOpenForVoting(status: number | string | undefined): boolean {
  const label = sakStatusLabel(status);
  return !['behandlet', 'trukket', 'bortfalt'].includes(label);
}

export function sakTypeLabel(type: number | string | undefined): string {
  if (type == null) return 'ukjent';
  if (typeof type === 'string') return type;
  return SAK_TYPE_LABELS[type] ?? `type_${type}`;
}

export function sakDokumentgruppeLabel(group: number | string | undefined): string {
  if (group == null) return 'ukjent';
  if (typeof group === 'string') return group;
  return SAK_DOKUMENTGRUPPE_LABELS[group] ?? `gruppe_${group}`;
}

/** Stortinget voteringsresultat: 2=for, 3=mot, 1=ikke_tilstede (verified mot antall_* felter). */
export function mapStortingetVoteCode(code: number | string): 'for' | 'mot' | 'ikke_tilstede' | 'ukjent' {
  if (code === 2 || code === 'for') return 'for';
  if (code === 3 || code === 'mot') return 'mot';
  if (code === 1 || code === 'ikke_tilstede') return 'ikke_tilstede';
  return 'ukjent';
}

export function formatEmneNavn(navn: string): string {
  if (!navn) return navn;
  const lower = navn.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
