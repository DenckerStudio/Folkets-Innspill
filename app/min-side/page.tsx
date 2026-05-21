'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { User, Settings, Bell, Shield, LogOut, FileText, CheckCircle, PieChart } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSaker } from '@/lib/stortinget';

function MinSideContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'historikk';
  const validatedTab = ['historikk', 'innstillinger', 'varsler', 'min-data', 'valgomat'].includes(initialTab) ? initialTab : 'historikk';
  
  const [activeTab, setActiveTab] = useState(validatedTab);
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    getSaker().then((data) => {
      if (isMounted) {
        setIssues(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const partyMatches = useMemo(() => {
    if (!issues.length) return [];

    // Simulate the user's last votes.
    // In a real app, this would be fetched from the backend history.
    // For this mock, we base it deterministically on the issue index to avoid flickering.
    const mockUserVotes = issues.slice(0, 15).map((issue, index) => ({
      issueId: issue.id,
      vote: index % 3 === 0 ? 'mot' : 'for' // Mostly 'for'
    }));

    // Base mock alignments for different parties
    const parties = [
      { name: 'Sosialistisk Venstreparti', color: 'bg-rose-500', biasForUser: 0.8 },
      { name: 'Arbeiderpartiet', color: 'bg-rose-600', biasForUser: 0.7 },
      { name: 'Venstre', color: 'bg-emerald-500', biasForUser: 0.6 },
      { name: 'Høyre', color: 'bg-blue-600', biasForUser: 0.35 },
      { name: 'Fremskrittspartiet', color: 'bg-indigo-900', biasForUser: 0.15 }
    ];

    // Calculate match percentages
    const results = parties.map(party => {
      let matchScore = 0;
      mockUserVotes.forEach(userVote => {
        // Simulate checking if the party's stance matches the user's vote
        // This logic uses the 'biasForUser' to represent how often this specific user
        // aligns with this specific party based on the mock history.
        // We use a deterministic pseudo-random sequence to prevent UI jumping
        const deterministicPseudoRandom = ((userVote.issueId.length + party.name.length) % 10) / 10;
        const partyVotesFor = deterministicPseudoRandom < party.biasForUser;
        const userVotesFor = userVote.vote === 'for';
        
        if (partyVotesFor === userVotesFor) {
          matchScore += 1;
        }
      });
      
      const matchPercentage = Math.round((matchScore / mockUserVotes.length) * 100);
      
      return {
        party: party.name,
        match: matchPercentage,
        color: party.color
      };
    });

    // Sort by highest match percentage
    return results.sort((a, b) => b.match - a.match);
  }, [issues]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="md:flex md:items-center md:justify-between mb-8 text-center md:text-left">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
            Min profil
          </h2>
          <p className="text-sm text-gray-500 mt-2 flex items-center justify-center md:justify-start">
            <Shield className="w-4 h-4 mr-1 text-emerald-500" />
            Verifisert bruker (Anonymisert profil)
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 justify-center">
          <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Logg ut
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex whitespace-nowrap min-w-max" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('historikk')}
              className={`${
                activeTab === 'historikk'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Mine stemmer
            </button>
            <button
              onClick={() => setActiveTab('valgomat')}
              className={`${
                activeTab === 'valgomat'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors`}
            >
              <PieChart className="w-4 h-4 mr-2" />
              Valgomat 2.0
            </button>
            <button
              onClick={() => setActiveTab('innstillinger')}
              className={`${
                activeTab === 'innstillinger'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Mine hjertesaker
            </button>
            <button
              onClick={() => setActiveTab('varsler')}
              className={`${
                activeTab === 'varsler'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors`}
            >
              <Bell className="w-4 h-4 mr-2" />
              Varsler
            </button>
            <button
              onClick={() => setActiveTab('min-data')}
              className={`${
                activeTab === 'min-data'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors`}
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacy Hub
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'historikk' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Siste stemmer</h3>
              <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul role="list" className="divide-y divide-gray-200">
                  {issues.slice(0, 2).map((issue, index) => (
                    <li key={issue.id}>
                      <Link href={`/sak/${issue.id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {issue.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${index === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {index === 0 ? 'For' : 'Mot'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {issue.category}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                Stemt: <time dateTime={issue.date}>{issue.date}</time>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'valgomat' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Valgomat 2.0</h3>
                <p className="text-gray-500">Basert på dine 15 siste stemmer, her er partiene du er mest enig med i praksis på Stortinget.</p>
              </div>
              
              <div className="space-y-6">
                {partyMatches.length > 0 ? (
                  partyMatches.map((result, index) => (
                    <div key={result.party} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center w-48">
                        <div className="text-lg font-bold text-gray-500 mr-4 w-6">#{index + 1}</div>
                        <div className="font-semibold text-gray-900 truncate">{result.party}</div>
                      </div>
                      
                      <div className="flex-1 max-w-md w-full">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${result.color} rounded-full`} style={{ width: `${result.match}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="text-right w-16">
                        <span className="text-xl font-bold text-gray-900">{result.match}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">Laster inn stemmehistorikk og beregner match...</div>
                )}
              </div>
              
              <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                <h4 className="font-bold text-indigo-900 mb-2">Slik fungerer det</h4>
                <p className="text-sm text-indigo-800">
                  Valgomat 2.0 er ikke basert på hva partiene <em>sier</em> i partiprogrammet sitt, men hva de <em>faktisk stemmer</em> i Stortingssalen. Hver gang du stemmer &quot;For&quot; eller &quot;Mot&quot; på en sak i appen, sammenlignes din stemme med det endelige voteringresultatet for hvert parti.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'innstillinger' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Interesseområder</h3>
              <p className="text-sm text-gray-500">Velg hvilke saksområder du ønsker å følge ekstra nøye med på.</p>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {['Helse og omsorg', 'Energi og miljø', 'Utdanning og forskning', 'Transport', 'Næring', 'Justis'].map((cat) => (
                  <label key={cat} className="relative flex items-start py-4 px-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <div className="min-w-0 flex-1 text-sm">
                      <span className="font-medium text-gray-900">{cat}</span>
                    </div>
                    <div className="ml-3 flex items-center h-5">
                      <input type="checkbox" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" defaultChecked={cat === 'Helse og omsorg' || cat === 'Energi og miljø'} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'varsler' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Varslingsinnstillinger</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Nye saker i mine interesseområder</h4>
                    <p className="text-sm text-gray-500">Få e-post når det legges ut nye saker du bryr deg om.</p>
                  </div>
                  <button type="button" className="bg-indigo-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" role="switch" aria-checked="true">
                    <span aria-hidden="true" className="translate-x-5 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Resultat av voteringer</h4>
                    <p className="text-sm text-gray-500">Få varsel når Stortinget har stemt over en sak du har engasjert deg i.</p>
                  </div>
                  <button type="button" className="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" role="switch" aria-checked="false">
                    <span aria-hidden="true" className="translate-x-0 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'min-data' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dine data og personvern</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Hvordan vi beskytter deg</h3>
                      <div className="mt-2 text-sm text-blue-700 space-y-2">
                        <p>1. Din identitet (BankID) brukes kun til å bekrefte at du er en ekte person og forhindre dobbelstemmer.</p>
                        <p>2. Dine stemmer lagres i en separat, anonymisert database. Ingen kan koble &quot;Navn Nordmann&quot; til en spesifikk stemme.</p>
                        <p>3. All data lagres på sikre servere i Norge/Europa i henhold til GDPR (Privacy by Design).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Slett historikk og data</h3>
                <p className="text-sm text-gray-500 mb-6">
                  I tråd med norsk lov og GDPR har du rett til å bli glemt. Du kan velge å slette kun din stemmehistorikk, eller slette hele profilen din.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Slett stemmehistorikk</h4>
                      <p className="text-xs text-gray-500 mt-1">Sletter alle dine tidligere stemmer. Profilen din forblir aktiv.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => alert('Historikk slettet (Dette er en demo)')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Slett historikk
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50">
                    <div>
                      <h4 className="text-sm font-medium text-red-900">Slett profil og all data</h4>
                      <p className="text-xs text-red-700 mt-1">Sletter profilen din, innstillinger og all stemmehistorikk permanent.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => alert('Profil slettet (Dette er en demo)')}
                      className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Slett alt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MinSidePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Laster...</div>}>
      <MinSideContent />
    </Suspense>
  );
}
