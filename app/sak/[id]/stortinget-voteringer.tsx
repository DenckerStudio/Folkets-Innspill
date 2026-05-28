'use client';

import { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, Users } from 'lucide-react';

type PartyRow = {
  partiId: string;
  partiNavn: string;
  for: number;
  mot: number;
  ikkeTilstede: number;
  majority: string;
};

type VoteringData = {
  main: {
    tema: string;
    vedtatt: boolean;
    antallFor: number;
    antallMot: number;
    personligVotering: boolean;
    resultatTekst: string | null;
    partyBreakdown: PartyRow[];
  } | null;
  voteringer: Array<{ votering_id: number; votering_tema?: string; vedtatt?: boolean }>;
};

export default function StortingetVoteringer({ sakId }: { sakId: string }) {
  const [data, setData] = useState<VoteringData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sak/${sakId}/voteringer`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [sakId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-48 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
      </div>
    );
  }

  if (!data?.main && (!data?.voteringer || data.voteringer.length === 0)) {
    return null;
  }

  const main = data?.main;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-900">Slik stemte Stortinget</h2>
      </div>

      {main ? (
        <>
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-900">{main.tema || 'Hovedvotering'}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center text-emerald-700">
                <ThumbsUp className="w-4 h-4 mr-1" />
                {main.antallFor} for
              </span>
              <span className="inline-flex items-center text-red-700">
                <ThumbsDown className="w-4 h-4 mr-1" />
                {main.antallMot} mot
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  main.vedtatt ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {main.resultatTekst || (main.vedtatt ? 'Vedtatt' : 'Forkastet')}
              </span>
            </div>
          </div>

          {main.partyBreakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Partifordeling (hovedvotering)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="py-2 pr-4 font-medium">Parti</th>
                      <th className="py-2 px-2 font-medium">For</th>
                      <th className="py-2 px-2 font-medium">Mot</th>
                      <th className="py-2 pl-2 font-medium">Flertall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {main.partyBreakdown.map((p) => (
                      <tr key={p.partiId} className="border-b border-gray-50">
                        <td className="py-2 pr-4 font-medium text-gray-900">{p.partiNavn}</td>
                        <td className="py-2 px-2 text-emerald-700">{p.for}</td>
                        <td className="py-2 px-2 text-red-700">{p.mot}</td>
                        <td className="py-2 pl-2 text-gray-600 capitalize">{p.majority === 'mixed' ? 'Delt' : p.majority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">Ingen personlig votering registrert for denne saken.</p>
      )}

      {data.voteringer.length > 1 && (
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer font-medium text-indigo-600">
            Vis alle {data.voteringer.length} voteringer
          </summary>
          <ul className="mt-3 space-y-2">
            {data.voteringer.map((v) => (
              <li key={v.votering_id} className="border-l-2 border-gray-200 pl-3">
                {v.votering_tema || `Votering ${v.votering_id}`}
                {v.vedtatt != null && (
                  <span className="ml-2 text-xs text-gray-500">{v.vedtatt ? 'vedtatt' : 'forkastet'}</span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
