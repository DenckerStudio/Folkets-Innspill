'use client';

import {
  ShieldCheck,
  BrainCircuit,
  Users,
  Coins,
  Info,
  FileText,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface SummaryCard {
  id: string;
  title: string;
  hint?: string;
  body: string;
}

interface SummaryData {
  cards: SummaryCard[];
  cached?: boolean;
  allApproved?: boolean;
  pendingCardIds?: string[];
}

const CARD_STYLES: { color: string; bg: string }[] = [
  { color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { color: 'text-amber-600', bg: 'bg-amber-50' },
  { color: 'text-violet-600', bg: 'bg-violet-50' },
  { color: 'text-rose-600', bg: 'bg-rose-50' },
];

const INITIAL_FETCH_TIMEOUT_MS = 300_000;
const POLL_FETCH_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 12;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (error instanceof Error && error.name === 'AbortError') return true;
  return false;
}

function pickIcon(card: SummaryCard): LucideIcon {
  const label = `${card.id} ${card.title} ${card.hint ?? ''}`.toLowerCase();
  if (/kostnad|økonomi|beløp|milliard|budsjett|kr\b/.test(label)) return Coins;
  if (/hvem|berør|rammes|påvirk|pasient|borgere|næring/.test(label)) return Users;
  if (/vedtak|lov|regel|innstilling/.test(label)) return Scale;
  if (/hva|forslag|hoved|bakgrunn|formål/.test(label)) return BrainCircuit;
  return FileText;
}

function parseCards(json: Record<string, unknown>): SummaryCard[] {
  if (!Array.isArray(json.cards)) return [];
  return json.cards
    .filter(
      (c): c is SummaryCard =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as SummaryCard).id === 'string' &&
        typeof (c as SummaryCard).title === 'string' &&
        typeof (c as SummaryCard).body === 'string'
    )
    .map((c) => ({
      id: c.id,
      title: c.title,
      hint: typeof c.hint === 'string' ? c.hint : undefined,
      body: c.body,
    }));
}

async function fetchAiSummary(
  sakId: string,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<{ res: Response; json: Record<string, unknown> }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const onParentAbort = () => controller.abort();
  signal?.addEventListener('abort', onParentAbort);

  try {
    const res = await fetch(`/api/sak/${sakId}/ai-summary`, {
      signal: controller.signal,
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { res, json };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onParentAbort);
  }
}

export default function AiSummary({
  sakId,
  title,
  summary,
}: {
  sakId: string;
  title: string;
  summary: string;
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SummaryData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const mountAbort = new AbortController();
    let cancelled = false;

    async function fetchSummary() {
      let attempt = 0;
      let hasCardsEver = false;

      while (!cancelled && attempt < MAX_ATTEMPTS) {
        attempt += 1;
        const timeoutMs =
          attempt === 1 ? INITIAL_FETCH_TIMEOUT_MS : POLL_FETCH_TIMEOUT_MS;

        try {
          const { res, json } = await fetchAiSummary(
            sakId,
            timeoutMs,
            mountAbort.signal
          );

          if (cancelled) return;

          if (res.ok && !json?.error) {
            const cards = parseCards(json);
            if (cards.length) hasCardsEver = true;

            const pendingCardIds = Array.isArray(json.pendingCardIds)
              ? (json.pendingCardIds as string[])
              : [];

            setData({
              cards: cards.length ? cards : (data?.cards ?? []),
              cached: json.cached === true,
              allApproved: json.allApproved === true,
              pendingCardIds,
            });

            setErrorMessage(null);

            if (json.allApproved === true && cards.length >= 3) {
              setLoading(false);
              return;
            }

            if (cards.length > 0) {
              setLoading(false);
            } else {
              setErrorMessage('Leser saksdokumenter og genererer oppsummering …');
              setLoading(true);
            }

            if (json.allApproved === true) return;

            const retryAfter =
              typeof json.retry_after_seconds === 'number' && json.retry_after_seconds > 0
                ? json.retry_after_seconds
                : 6;

            setErrorMessage(
              hasCardsEver
                ? 'Kvalitetssjekker gjenværende kort …'
                : 'Leser saksdokumenter og genererer oppsummering …'
            );
            await sleep(retryAfter * 1000);
            continue;
          }

          setErrorMessage('Genererer AI-oppsummering …');
          setLoading(true);
          await sleep(10_000);
        } catch (error) {
          if (cancelled || mountAbort.signal.aborted) return;

          if (isAbortError(error)) {
            setErrorMessage(
              hasCardsEver
                ? 'Henter oppdatert status …'
                : 'Genereringen tar tid – henter status på nytt …'
            );
            setLoading(!hasCardsEver);
            await sleep(4_000);
            continue;
          }

          console.error('Failed to fetch AI summary', error);
          setErrorMessage('Genererer AI-oppsummering …');
          await sleep(10_000);
        }
      }

      if (cancelled) return;

      setLoading(false);
      setData((prev) => {
        if (prev?.cards?.length) return prev;
        setErrorMessage('Kunne ikke generere AI-oppsummering akkurat nå.');
        return {
          cards: [
            {
              id: 'om-saken',
              title: 'Om saken',
              body: title || summary,
            },
            {
              id: 'mer-info',
              title: 'Les mer',
              body: 'Se saksdokumentene på siden for full oversikt.',
            },
          ],
          allApproved: false,
        };
      });
    }

    fetchSummary();
    return () => {
      cancelled = true;
      mountAbort.abort();
    };
  }, [sakId, title, summary]);

  const pending = new Set(data?.pendingCardIds ?? []);
  const showGlobalLoading = loading && !data?.cards?.length;

  if (showGlobalLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-8 animate-pulse">
        <div className="h-6 bg-indigo-100 rounded w-1/3 mb-6" />
        {errorMessage && (
          <div className="text-sm text-indigo-700 mb-3">{errorMessage}</div>
        )}
        <div className="space-y-4">
          <div className="h-4 bg-indigo-50 rounded w-full" />
          <div className="h-4 bg-indigo-50 rounded w-5/6" />
          <div className="h-4 bg-indigo-50 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!data?.cards?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-8 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <ShieldCheck className="w-6 h-6 text-indigo-600 mr-2" />
          AI-forklart (nøytral)
        </h2>
        <div className="flex items-center gap-2">
          {data.cached && data.allApproved && (
            <span className="text-xs text-gray-500 hidden sm:inline">Lagret sammendrag</span>
          )}
          {!data.allApproved && errorMessage && (
            <span className="text-xs text-indigo-600 hidden sm:inline">{errorMessage}</span>
          )}
          <span className="text-xs text-gray-400 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Generert lokalt
          </span>
        </div>
      </div>

      <div
        className={`grid gap-6 ${
          data.cards.length >= 3
            ? 'md:grid-cols-2 lg:grid-cols-3'
            : 'md:grid-cols-2'
        }`}
      >
        {data.cards.map((card, index) => {
          const style = CARD_STYLES[index % CARD_STYLES.length];
          const Icon = pickIcon(card);
          const isPending = pending.has(card.id) || !card.body?.trim();

          return (
            <div key={card.id} className={`${style.bg} rounded-xl p-5`}>
              <div className={`flex items-center ${style.color} font-semibold mb-1`}>
                <Icon className="w-5 h-5 mr-2 shrink-0" />
                {card.title}
              </div>
              {card.hint && (
                <p className="text-xs text-gray-500 mb-2">{card.hint}</p>
              )}
              {isPending ? (
                <div className="space-y-2 animate-pulse" aria-busy="true">
                  <div className="h-3 bg-white/60 rounded w-full" />
                  <div className="h-3 bg-white/60 rounded w-5/6" />
                  <p className="text-xs text-gray-500 pt-1">Kvalitetssjekkes …</p>
                </div>
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">{card.body}</p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
