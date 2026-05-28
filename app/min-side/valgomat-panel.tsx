'use client';

import { useEffect, useState } from 'react';
import { PieChart } from 'lucide-react';

type PartyScore = {
  partiId: string;
  partiNavn: string;
  agree: number;
  disagree: number;
  skipped: number;
  score: number;
};

export default function ValgomatPanel() {
  const [scores, setScores] = useState<PartyScore[]>([]);
  const [comparedIssues, setComparedIssues] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/valgomat')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.scores)) setScores(data.scores);
        setComparedIssues(data.comparedIssues ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />;
  }

  if (scores.length === 0 || comparedIssues === 0) {
    return (
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <h4 className="font-bold text-indigo-900 mb-2">Slik fungerer det</h4>
        <p className="text-sm text-indigo-800">
          Valgomat 2.0 sammenligner dine stemmer med faktiske voteringer i Stortingssalen. Stem på saker som
          allerede er behandlet for å se hvilket parti du er mest enig med.
        </p>
      </div>
    );
  }

  const maxScore = scores[0]?.score ?? 0;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800">
        Basert på {comparedIssues} saker med voteringdata fra Stortinget.
      </div>

      <div className="space-y-3">
        {scores.slice(0, 9).map((party) => (
          <div key={party.partiId} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">{party.partiNavn}</span>
              <span className="text-lg font-bold text-indigo-600">{party.score}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${maxScore > 0 ? (party.score / maxScore) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enig i {party.agree} voteringer · Uenig i {party.disagree}
              {party.skipped > 0 ? ` · ${party.skipped} uten sammenligning` : ''}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 flex items-start gap-2">
        <PieChart className="w-4 h-4 shrink-0 mt-0.5" />
        Beregningen sammenligner din stemme (for/mot) med flertallet i hver representants parti ved hovedvotering.
        Avståelser og saker uten personlig votering telles ikke.
      </p>
    </div>
  );
}
