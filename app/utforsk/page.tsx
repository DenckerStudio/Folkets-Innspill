import Link from 'next/link';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { mockIssues, categories } from '@/lib/data';

export default function ExplorePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Utforsk Saker</h1>
        <p className="mt-2 text-gray-600">Søk og filtrer blant alle saker fra Stortinget.</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Søk etter saker, stikkord eller saksnummer..."
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border appearance-none bg-white">
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border appearance-none bg-white">
            <option>Nyeste først</option>
            <option>Mest engasjement</option>
            <option>Snart votering</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {mockIssues.map((issue) => (
          <Link key={issue.id} href={`/sak/${issue.id}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
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
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{issue.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-2">{issue.summary}</p>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{issue.votes.total.toLocaleString('no-NO')}</span> har stemt
              </div>
              <div className="text-indigo-600 text-sm font-medium flex items-center">
                Les mer og stem <ArrowRight className="ml-1 w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
