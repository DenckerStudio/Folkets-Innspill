'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { mockIssues } from '@/lib/data';
import { ArrowLeft, ThumbsUp, ThumbsDown, Minus, Info, Share2, Bookmark, History, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { use } from 'react';

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const issue = mockIssues.find(i => i.id === id);
  const [userVote, setUserVote] = useState<'for' | 'against' | 'abstain' | null>(null);

  if (!issue) {
    notFound();
  }

  const handleVote = (vote: 'for' | 'against' | 'abstain') => {
    // In a real app, this would require authentication and an API call
    setUserVote(vote);
  };

  const totalVotes = issue.votes.total + (userVote ? 1 : 0);
  const forVotes = issue.votes.for + (userVote === 'for' ? 1 : 0);
  const againstVotes = issue.votes.against + (userVote === 'against' ? 1 : 0);
  const abstainVotes = issue.votes.abstain + (userVote === 'abstain' ? 1 : 0);

  const forPercent = Math.round((forVotes / totalVotes) * 100) || 0;
  const againstPercent = Math.round((againstVotes / totalVotes) * 100) || 0;
  const abstainPercent = Math.round((abstainVotes / totalVotes) * 100) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/utforsk" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Tilbake til oversikten
        </Link>
        <div className="flex gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
              {issue.category}
            </span>
            <span className="text-sm text-gray-500 font-medium">
              Votering: {issue.date}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {issue.title}
          </h1>

          <div className="prose prose-indigo max-w-none text-gray-600 mb-8">
            <p className="text-lg leading-relaxed">{issue.summary}</p>
          </div>

          {/* Voting Section */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Hva mener du?</h2>
              <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                <Info className="w-4 h-4 mr-2 text-indigo-500" />
                Din stemme er anonym
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => handleVote('for')}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                  userVote === 'for'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50 text-gray-700'
                }`}
              >
                <ThumbsUp className={`w-8 h-8 mb-3 ${userVote === 'for' ? 'text-emerald-500' : 'text-gray-400'}`} />
                <span className="font-semibold text-lg">For</span>
              </button>
              
              <button
                onClick={() => handleVote('against')}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                  userVote === 'against'
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50 text-gray-700'
                }`}
              >
                <ThumbsDown className={`w-8 h-8 mb-3 ${userVote === 'against' ? 'text-rose-500' : 'text-gray-400'}`} />
                <span className="font-semibold text-lg">Mot</span>
              </button>

              <button
                onClick={() => handleVote('abstain')}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                  userVote === 'abstain'
                    ? 'border-gray-500 bg-gray-100 text-gray-800'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Minus className={`w-8 h-8 mb-3 ${userVote === 'abstain' ? 'text-gray-600' : 'text-gray-400'}`} />
                <span className="font-semibold text-lg">Avholdende</span>
              </button>
            </div>

            {/* Results Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                <span>Folkets dom ({totalVotes.toLocaleString('no-NO')} stemmer)</span>
              </div>
              <div className="h-4 flex rounded-full overflow-hidden bg-gray-200">
                <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${forPercent}%` }}></div>
                <div className="bg-gray-400 transition-all duration-500" style={{ width: `${abstainPercent}%` }}></div>
                <div className="bg-rose-500 transition-all duration-500" style={{ width: `${againstPercent}%` }}></div>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-emerald-600 font-medium">{forPercent}% For</span>
                <span className="text-gray-500 font-medium">{abstainPercent}% Avholdende</span>
                <span className="text-rose-600 font-medium">{againstPercent}% Mot</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis / Context (Mock) */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">✨</span>
          AI-Sammendrag av debatten
        </h3>
        <div className="space-y-4 text-gray-600">
          <p>
            Hovedargumentene <strong>for</strong> forslaget vektlegger behovet for umiddelbar handling for å sikre pasientsikkerheten og redusere arbeidsbelastningen for leger.
          </p>
          <p>
            Hovedargumentene <strong>mot</strong> peker på at forslaget er for kostbart, og at man heller bør vente på en helhetlig gjennomgang av finansieringsmodellen.
          </p>
        </div>
      </div>

      {/* Historical Data & Trend Analysis */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className="bg-amber-100 text-amber-600 p-2 rounded-lg mr-3">📊</span>
          Historiske data & Trendanalyse
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AI Trend Analysis */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
              AI-Trendanalyse
            </h4>
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 text-indigo-900 text-sm leading-relaxed">
              <p className="mb-3">
                Basert på analyse av 14 lignende saker de siste 5 årene innen <strong>{issue.category}</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Forslag som innebærer økte bevilgninger over statsbudsjettet blir oftest nedstemt (78% av tilfellene) med mindre de fremmes av regjeringspartiene.</li>
                <li>Folkelig engasjement på plattformen viser at saker med over 10 000 stemmer har en 30% høyere sjanse for å bli sendt tilbake til komiteen for ny vurdering.</li>
                <li><strong>Potensielt utfall:</strong> Høy sannsynlighet for at forslaget blir vedlagt protokollen, men at deler av innholdet inkorporeres i regjeringens kommende stortingsmelding.</li>
              </ul>
            </div>
          </div>

          {/* Similar Historical Issues */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <History className="w-4 h-4 mr-2 text-gray-500" />
              Lignende historiske saker
            </h4>
            <div className="space-y-3">
              <Link href="#" className="block p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-gray-900">Styrking av legevakttjenesten</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
                    Nedstemt
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Behandlet: Mars 2024</span>
                  <span>62% mot (Stortinget)</span>
                </div>
              </Link>
              
              <Link href="#" className="block p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-gray-900">Handlingsplan for allmennlegetjenesten</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    Vedtatt
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Behandlet: Mai 2020</span>
                  <span>Enstemmig (Stortinget)</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
