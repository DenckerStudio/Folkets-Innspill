'use client';

import { ShieldCheck, BrainCircuit, Users, Coins, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function AiSummary({ sakId, title, summary }: { sakId: string; title: string; summary: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ hva: string; hvem: string; kostnad: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      const MAX_ATTEMPTS = 5;
      let attempt = 0;

      while (!cancelled && attempt < MAX_ATTEMPTS) {
        attempt += 1;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 120_000);

          const res = await fetch(`/api/sak/${sakId}/ai-summary`, { signal: controller.signal });
          clearTimeout(timeout);

          const json = await res.json().catch(() => ({}));

          if (res.ok && !json?.error) {
            if (!cancelled) {
              setErrorMessage(null);
              setData({
                hva: json.hva || 'Ingen informasjon tilgjengelig.',
                hvem: json.hvem || 'Ukjent',
                kostnad: json.kostnad || 'Ukjent',
              });
              setLoading(false);
            }
            return;
          }

          const retryAfterSeconds =
            typeof json?.retry_after_seconds === 'number' && json.retry_after_seconds > 0
              ? json.retry_after_seconds
              : 10;

          if (!cancelled) {
            setErrorMessage('Genererer AI-oppsummering …');
            setLoading(true);
          }

          await new Promise((r) => setTimeout(r, retryAfterSeconds * 1000));
          continue;
        } catch (error) {
          console.error('Failed to fetch summary', error);
          if (!cancelled) {
            setErrorMessage('Genererer AI-oppsummering …');
            setLoading(true);
          }
          await new Promise((r) => setTimeout(r, 10_000));
        }
      }

      if (!cancelled) {
        setLoading(false);
        setErrorMessage('Kunne ikke generere AI-oppsummering akkurat nå.');
        setData({
          hva: `Saken handler om: ${title}`,
          hvem: 'Se saksdokumentene for detaljer.',
          kostnad: summary.includes('milliard') || summary.includes('kr')
            ? 'Se saksdokumentene for økonomiske tall.'
            : 'Ikke spesifisert i kortversjonen.',
        });
      }
    }

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [sakId, title, summary]);

  if (loading) {
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

  const items = [
    { icon: BrainCircuit, label: 'Hva?', text: data.hva, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: Users, label: 'Hvem?', text: data.hvem, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Coins, label: 'Kostnad?', text: data.kostnad, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

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
        <span className="text-xs text-gray-400 flex items-center">
          <Info className="w-3 h-3 mr-1" />
          Generert lokalt
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-5`}>
            <div className={`flex items-center ${item.color} font-semibold mb-2`}>
              <item.icon className="w-5 h-5 mr-2" />
              {item.label}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
