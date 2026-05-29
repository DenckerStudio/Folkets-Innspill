'use client';

import Link from 'next/link';
import { Search, Filter, ArrowRight, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { getSaker } from '@/lib/stortinget';
import { useState, useEffect, useMemo } from 'react';
import FadeIn from '@/components/fade-in';

export default function ExplorePage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatedVotes, setSimulatedVotes] = useState<Record<string, 'for' | 'against' | 'abstain'>>({});
  
  // Filtering and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle kategorier');
  const [selectedStatus, setSelectedStatus] = useState('Alle statuser');
  const [sortBy, setSortBy] = useState('Nyeste først');

  useEffect(() => {
    let isMounted = true;
    getSaker().then((data) => {
      if (isMounted) {
        setIssues(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically extract unique categories from the fetched issues
  const categories = useMemo(() => {
    const cats = new Set(issues.map(issue => issue.category));
    return Array.from(cats).sort();
  }, [issues]);

  // Filter and sort issues
  let displayedIssues = issues;

  // 1. Apply category filter
  if (selectedCategory !== 'Alle kategorier') {
    displayedIssues = displayedIssues.filter(issue => issue.category === selectedCategory);
  }

  // 1.5 Apply status filter
  if (selectedStatus === 'Åpne for stemmer') {
    displayedIssues = displayedIssues.filter(issue => issue.status !== 'closed');
  } else if (selectedStatus === 'Ferdigbehandlet / Historikk') {
    displayedIssues = displayedIssues.filter(issue => issue.status === 'closed');
  }

  // 2. Apply search query
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    displayedIssues = displayedIssues.filter(issue => 
      issue.title.toLowerCase().includes(query) || 
      issue.summary.toLowerCase().includes(query) ||
      issue.id.toString().includes(query)
    );
  }

  // 3. Apply sorting
  displayedIssues = [...displayedIssues].sort((a, b) => {
    if (sortBy === 'Nyeste først') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'Mest engasjement') {
      return b.votes.total - a.votes.total;
    } else if (sortBy === 'Snart votering') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return 0;
  });

  const handleSimulateVote = (e: React.MouseEvent, issueId: string, vote: 'for' | 'against' | 'abstain') => {
    e.preventDefault(); // Prevent link navigation
    setSimulatedVotes(prev => ({ ...prev, [issueId]: vote }));
  };

  const clearSimulatedVote = (e: React.MouseEvent, issueId: string) => {
    e.preventDefault(); // Prevent link navigation
    setSimulatedVotes(prev => {
      const newVotes = { ...prev };
      delete newVotes[issueId];
      return newVotes;
    });
  };

  return (
    <div className="space-y-8">
      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Utforsk Saker</h1>
            <p className="mt-2 text-gray-600">Søk og filtrer blant alle saker fra Stortinget.</p>
          </div>
        </div>
      </FadeIn>

      {/* Search and Filter Bar */}
      <FadeIn delay={0.2} direction="up">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Søk etter saker, stikkord eller saksnummer..."
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border appearance-none bg-white"
            >
              <option value="Alle statuser">Alle statuser</option>
              <option value="Åpne for stemmer">Åpne for stemmer</option>
              <option value="Ferdigbehandlet / Historikk">Historikk (Ferdigbehandlet)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          <div className="relative">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border appearance-none bg-white"
            >
              <option value="Alle kategorier">Alle kategorier</option>
              {categories.map(cat => (
                <option key={cat as string} value={cat as string}>{cat as string}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border appearance-none bg-white"
          >
            <option value="Nyeste først">Nyeste først</option>
            <option value="Mest engasjement">Mest engasjement</option>
            <option value="Snart votering">Snart votering</option>
          </select>
        </div>
      </div>
      </FadeIn>

      {/* Issues List */}
      <FadeIn delay={0.3} direction="up">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Laster saker...</div>
          ) : displayedIssues.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Ingen saker funnet som matcher dine kriterier.
            </div>
          ) : (
            displayedIssues.map((issue: any, index: number) => (
              <FadeIn key={issue.id} delay={0.1 * Math.min(index, 5)} direction="up">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
              <Link href={`/dashboard/sak/${issue.id}`} className="block p-6 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {issue.category}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      issue.status === 'closed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {issue.status === 'closed' ? 'Ferdigbehandlet' : 'Åpen for stemmer'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">Votering: {issue.date}</span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{issue.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{issue.summary}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-1">{formatNumber(issue.votes.total)}</span> stemmer
                    </div>
                  </div>
                  <div className="text-indigo-600 text-sm font-medium flex items-center">
                    Les mer <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </div>
              </Link>
              
              {/* Vote Simulation Section */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                {!simulatedVotes[issue.id] ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700">Hva ville du stemt?</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleSimulateVote(e, issue.id, 'for')} 
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1.5" /> For
                      </button>
                      <button 
                        onClick={(e) => handleSimulateVote(e, issue.id, 'against')} 
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4 mr-1.5" /> Mot
                      </button>
                      <button 
                        onClick={(e) => handleSimulateVote(e, issue.id, 'abstain')} 
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4 mr-1.5" /> Avstår
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-900">
                        Din simulering: <span className={
                          simulatedVotes[issue.id] === 'for' ? 'text-emerald-600' : 
                          simulatedVotes[issue.id] === 'against' ? 'text-rose-600' : 'text-gray-600'
                        }>
                          {simulatedVotes[issue.id] === 'for' ? 'For' : 
                           simulatedVotes[issue.id] === 'against' ? 'Mot' : 'Avstår'}
                        </span>
                      </span>
                      <button onClick={(e) => clearSimulatedVote(e, issue.id)} className="text-xs text-indigo-600 hover:underline">
                        Endre stemme
                      </button>
                    </div>
                    
                    {/* Result Bar */}
                    {(() => {
                      const total = issue.votes.total || 1;
                      const forPct = Math.round((issue.votes.for / total) * 100);
                      const againstPct = Math.round((issue.votes.against / total) * 100);
                      const abstainPct = Math.round((issue.votes.abstain / total) * 100);
                      
                      const userVote = simulatedVotes[issue.id];
                      const userAgreesWithMajority = 
                        (userVote === 'for' && forPct > againstPct) || 
                        (userVote === 'against' && againstPct > forPct);
                      
                      return (
                        <div className="space-y-2">
                          <div className="w-full h-2.5 bg-gray-200 rounded-full flex overflow-hidden">
                            <div style={{ width: `${forPct}%` }} className="bg-emerald-500" title={`For: ${forPct}%`} />
                            <div style={{ width: `${againstPct}%` }} className="bg-rose-500" title={`Mot: ${againstPct}%`} />
                            <div style={{ width: `${abstainPct}%` }} className="bg-gray-400" title={`Avstår: ${abstainPct}%`} />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-emerald-700 font-medium">{forPct}% For</span>
                            <span className="text-gray-500">{abstainPct}% Avstår</span>
                            <span className="text-rose-700 font-medium">{againstPct}% Mot</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-2 bg-white p-2 rounded border border-gray-100">
                            {userVote === 'abstain' ? (
                              'Du valgte å avstå. ' + abstainPct + '% av andre har gjort det samme.'
                            ) : userAgreesWithMajority ? (
                              <span className="text-emerald-700 font-medium">Du er enig med flertallet!</span>
                            ) : (
                              <span className="text-amber-600 font-medium">Du stemmer mot flertallet.</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
            </FadeIn>
          ))
        )}
      </div>
      </FadeIn>
    </div>
  );
}
