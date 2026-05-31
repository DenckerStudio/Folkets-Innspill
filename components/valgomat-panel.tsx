'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

type PartyScore = {
  party: string;
  agreement_percent: number;
  compared_issues: number;
};

export function ValgomatPanel({ voteCount }: { voteCount: number }) {
  const [scores, setScores] = useState<PartyScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (voteCount === 0) {
      setLoading(false);
      return;
    }
    fetch('/api/user/valgomat')
      .then((res) => res.json())
      .then((data) => setScores(data.scores || []))
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, [voteCount]);

  if (voteCount === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Du må stemme på minst noen saker for å se din Valgomat.</p>
        <Link href={routes.utforsk} className="mt-4 inline-block text-indigo-600 font-medium hover:text-indigo-500">
          Utforsk saker →
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-gray-500 py-6 text-center">Beregner partiforslag…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
        Basert på {voteCount} stemmer. Sammenligning med partivurdering per sak utvides løpende.
      </div>
      <ul className="space-y-3">
        {scores.map((row) => (
          <li key={row.party}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-900">{row.party}</span>
              <span className="text-gray-600">{row.agreement_percent}% enighet</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${row.agreement_percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
