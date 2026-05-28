import { getPublikasjonText, getSakDetail } from '@/lib/stortinget';

const MAX_PUBLICATIONS = 2;
const MAX_TOTAL_DOC_CHARS = 6_000;
const MAX_PER_DOC_CHARS = 3_000;

const TYPE_PRIORITY: Record<string, number> = {
  dok8: 0,
  dok: 1,
  innst: 2,
  melding: 3,
  proposisjon: 4,
  referat: 9,
};

type PublikasjonRef = {
  eksport_id?: string | number | null;
  lenke_tekst?: string | null;
  type?: unknown;
};

function coerceApiString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as { navn?: unknown; id?: unknown; type?: unknown };
    if (typeof obj.navn === 'string' && obj.navn.trim()) return obj.navn.trim();
    if (typeof obj.id === 'string' && obj.id.trim()) return obj.id.trim();
    if (typeof obj.type === 'string' && obj.type.trim()) return obj.type.trim();
  }
  return undefined;
}

export const SAK_TYPE_LABELS: Record<number, string> = {
  0: 'Alminnelig sak',
  1: 'Lovsak',
  2: 'Stortingssak',
  3: 'Budsjett',
  4: 'Interpellasjon',
  5: 'Spørsmål',
};

function publicationPriority(type: unknown): number {
  const normalized = coerceApiString(type);
  if (!normalized) return 5;
  const key = normalized.toLowerCase();
  for (const [prefix, score] of Object.entries(TYPE_PRIORITY)) {
    if (key.includes(prefix)) return score;
  }
  return 5;
}

function normalizeRefs(detail: Record<string, unknown>): PublikasjonRef[] {
  const list = detail.publikasjon_referanse_liste as
    | { publikasjon_referanse?: PublikasjonRef | PublikasjonRef[] }
    | PublikasjonRef[]
    | undefined;

  if (!list) return [];

  if (Array.isArray(list)) {
    return list;
  }

  const nested = list.publikasjon_referanse;
  if (!nested) return [];
  return Array.isArray(nested) ? nested : [nested];
}

export interface SakDocumentBundle {
  sakType?: number;
  sakTypeLabel?: string;
  documentExcerpts?: string;
  publikasjonTitles: string[];
  forslagstillere: Array<{ navn?: string }>;
  komite?: string;
}

export async function fetchSakDocuments(
  issueId: string,
  existingDetail?: Record<string, unknown> | null
): Promise<SakDocumentBundle> {
  const detail =
    existingDetail ?? (await getSakDetail(issueId, { nextRevalidateSeconds: 3600 }));
  if (!detail) {
    return { publikasjonTitles: [], forslagstillere: [] };
  }

  const sakType =
    typeof detail.type === 'number' ? detail.type : undefined;
  const sakTypeLabel =
    sakType != null ? SAK_TYPE_LABELS[sakType] ?? `Type ${sakType}` : undefined;

  const forslagstillerListe = detail.sak_opphav?.forslagstiller_liste;
  const forslagstillere: Array<{ navn?: string }> = [];
  if (Array.isArray(forslagstillerListe)) {
    for (const f of forslagstillerListe) {
      let navn = '';
      if (typeof f === 'string') {
        navn = f;
      } else if (f && typeof f === 'object') {
        const obj = f as { navn?: string; fornavn?: string; etternavn?: string };
        navn =
          obj.navn?.trim() ||
          [obj.fornavn, obj.etternavn].filter(Boolean).join(' ').trim();
      }
      if (navn) forslagstillere.push({ navn });
    }
  }

  const komiteRaw = detail.komite;
  const komite =
    typeof komiteRaw === 'object' && komiteRaw && 'navn' in komiteRaw
      ? String((komiteRaw as { navn?: string }).navn ?? '')
      : typeof komiteRaw === 'string'
        ? komiteRaw
        : undefined;

  const refs = normalizeRefs(detail as Record<string, unknown>)
    .filter((r) => coerceApiString(r.eksport_id))
    .sort(
      (a, b) =>
        publicationPriority(a.type) - publicationPriority(b.type)
    )
    .slice(0, MAX_PUBLICATIONS);

  const publikasjonTitles: string[] = [];
  const excerptParts: string[] = [];
  let totalChars = 0;

  const fetchResults = await Promise.all(
    refs.map(async (ref) => {
      const id = coerceApiString(ref.eksport_id)!;
      const title = coerceApiString(ref.lenke_tekst) || id;
      const text = await getPublikasjonText(id, MAX_PER_DOC_CHARS);
      const typeLabel = coerceApiString(ref.type);
      return { title, text, typeLabel };
    })
  );

  for (const { title, text, typeLabel } of fetchResults) {
    publikasjonTitles.push(title);
    if (text && totalChars < MAX_TOTAL_DOC_CHARS) {
      const budget = MAX_TOTAL_DOC_CHARS - totalChars;
      const clipped = text.length > budget ? `${text.slice(0, budget)}…` : text;
      excerptParts.push(
        `### ${title}${typeLabel ? ` (${typeLabel})` : ''}\n${clipped}`
      );
      totalChars += clipped.length;
    }
  }

  const metaOnly = normalizeRefs(detail as Record<string, unknown>)
    .filter((r) => !coerceApiString(r.eksport_id) && coerceApiString(r.lenke_tekst))
    .slice(0, 5);
  for (const r of metaOnly) {
    const t = coerceApiString(r.lenke_tekst)!;
    if (!publikasjonTitles.includes(t)) {
      publikasjonTitles.push(t);
    }
  }

  return {
    sakType,
    sakTypeLabel,
    documentExcerpts: excerptParts.length ? excerptParts.join('\n\n') : undefined,
    publikasjonTitles,
    forslagstillere,
    komite,
  };
}
