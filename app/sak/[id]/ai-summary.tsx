'use client';

import { ShieldCheck, BrainCircuit, Users, Coins, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

type SummaryFieldKey = 'hva' | 'hvem' | 'kostnad';

interface SummaryData {
  hva?: string;
  hvem?: string;
  kostnad?: string;
  cached?: boolean;
  allApproved?: boolean;
  pendingFields?: SummaryFieldKey[];
}

const FIELD_KEYS: SummaryFieldKey[] = ['hva', 'hvem', 'kostnad'];

const CARD_CONFIG = [
  { key: 'hva' as const, icon: BrainCircuit, label: 'Hva?', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'hvem' as const, icon: Users, label: 'Hvem?', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'kostnad' as const, icon: Coins, label: 'Kostnad?', color: 'text-amber-600', bg: 'bg-amber-50' },
];

function applyApiPayload(
  json: Record<string, unknown>,
  prev: SummaryData | null
): SummaryData {
  const pendingFields = Array.isArray(json.pendingFields)
    ? (json.pendingFields as SummaryFieldKey[]).filter((f) =>
        FIELD_KEYS.includes(f)
      )
    : [];

  return {
    hva: typeof json.hva === 'string' ? json.hva : prev?.hva,
    hvem: typeof json.hvem === 'string' ? json.hvem : prev?.hvem,
    kostnad: typeof json.kostnad === 'string' ? json.kostnad : prev?.kostnad,
    cached: json.cached === true,
    allApproved: json.allApproved === true,
    pendingFields,
  };
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
    let cancelled = false;

    async function fetchSummary() {
      const MAX_ATTEMPTS = 8;
      let attempt = 0;

      while (!cancelled && attempt < MAX_ATTEMPTS) {
        attempt += 1;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 120_000);

          const res = await fetch(`/api/sak/${sakId}/ai-summary`, {
            signal: controller.signal,
          });
          clearTimeout(timeout);

          const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

          if (res.ok && !json?.error) {
            setData((prev) => applyApiPayload(json, prev));
            const hasAnyField = Boolean(json.hva || json.hvem || json.kostnad);
            const allApproved = json.allApproved === true;

            if (!cancelled) {
              setErrorMessage(null);

              if (
                allApproved &&
                typeof json.hva === 'string' &&
                typeof json.hvem === 'string' &&
                typeof json.kostnad === 'string'
              ) {
                setLoading(false);
                return;
              }

              if (hasAnyField) {
                setLoading(false);
              } else {
                setErrorMessage('Genererer og kvalitetssjekker AI-oppsummering …');
                setLoading(true);
              }
            }

            if (allApproved) return;

            const retryAfterSeconds =
              typeof json?.retry_after_seconds === 'number' && json.retry_after_seconds > 0
                ? json.retry_after_seconds
                : 8;

            if (!cancelled) {
              setErrorMessage('Kvalitetssjekker gjenværende felt …');
            }
            await new Promise((r) => setTimeout(r, retryAfterSeconds * 1000));
            continue;
          }

          const retryAfterSeconds =
            typeof json?.retry_after_seconds === 'number' && json.retry_after_seconds > 0
              ? json.retry_after_seconds
              : 10;

          if (!cancelled) {
            setErrorMessage('Genererer og kvalitetssjekker AI-oppsummering …');
            setLoading(true);
          }

          await new Promise((r) => setTimeout(r, retryAfterSeconds * 1000));
        } catch (error) {
          console.error('Failed to fetch AI summary', error);
          if (!cancelled) {
            setErrorMessage('Genererer og kvalitetssjekker AI-oppsummering …');
            setLoading(true);
          }
          await new Promise((r) => setTimeout(r, 10_000));
        }
      }

      if (!cancelled) {
        setLoading(false);
        setData((prev) => {
          if (prev?.hva || prev?.hvem || prev?.kostnad) return prev;
          setErrorMessage('Kunne ikke generere AI-oppsummering akkurat nå.');
          return {
            hva: `Saken handler om: ${title}`,
            hvem: 'Se saksdokumentene for detaljer.',
            kostnad:
              summary.includes('milliard') || summary.includes('kr')
                ? 'Se saksdokumentene for økonomiske tall.'
                : 'Ikke spesifisert i kortversjonen.',
            allApproved: false,
          };
        });
      }
    }

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [sakId, title, summary]);

  const pending = new Set(data?.pendingFields ?? []);
  const showGlobalLoading = loading && !data?.hva && !data?.hvem && !data?.kostnad;

  if (showGlobalLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-8 animate-pulse">
        <div className="h-6 bg-indigo-100 rounded w-1/3 mb-6"></div>
        {errorMessage && <div className="text-sm text-indigo-700 mb-3">{errorMessage}</div>}
        <div className="space-y-4">
          <div className="h-4 bg-indigo-50 rounded w-full"></div>
          <div className="h-4 bg-indigo-50 rounded w-5/6"></div>
          <div className="h-4 bg-indigo-50 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

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

      <div className="grid gap-6 md:grid-cols-3">
        {CARD_CONFIG.map((item) => {
          const text = data[item.key];
          const isPending = pending.has(item.key) || !text;

          return (
            <div key={item.label} className={`${item.bg} rounded-xl p-5`}>
              <div className={`flex items-center ${item.color} font-semibold mb-2`}>
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </div>
              {isPending ? (
                <div className="space-y-2 animate-pulse" aria-busy="true">
                  <div className="h-3 bg-white/60 rounded w-full" />
                  <div className="h-3 bg-white/60 rounded w-5/6" />
                  <p className="text-xs text-gray-500 pt-1">Kvalitetssjekkes …</p>
                </div>
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
