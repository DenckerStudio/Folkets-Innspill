'use client';

import { useState } from 'react';
import { User, Settings, Bell, Shield, LogOut, FileText } from 'lucide-react';
import Link from 'next/link';

export default function MinSidePage() {
  const [activeTab, setActiveTab] = useState('historikk');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Min Side
          </h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <Shield className="w-4 h-4 mr-1 text-emerald-500" />
            Verifisert bruker (Anonym profil)
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <LogOut className="w-4 h-4 mr-2" />
            Logg ut
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('historikk')}
              className={`${
                activeTab === 'historikk'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Mine stemmer
            </button>
            <button
              onClick={() => setActiveTab('innstillinger')}
              className={`${
                activeTab === 'innstillinger'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Innstillinger
            </button>
            <button
              onClick={() => setActiveTab('varsler')}
              className={`${
                activeTab === 'varsler'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
            >
              <Bell className="w-4 h-4 mr-2" />
              Varsler
            </button>
            <button
              onClick={() => setActiveTab('personvern')}
              className={`${
                activeTab === 'personvern'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
            >
              <Shield className="w-4 h-4 mr-2" />
              Personvern
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'historikk' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Siste stemmer</h3>
              <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul role="list" className="divide-y divide-gray-200">
                  <li>
                    <Link href="/sak/1" className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Representantforslag om å styrke fastlegeordningen
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                              For
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              Helse og omsorg
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Stemt: <time dateTime="2026-10-10">10. okt 2026</time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/sak/2" className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Utbygging av havvind i Sørlige Nordsjø II
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-100 text-rose-800">
                              Mot
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              Energi og miljø
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Stemt: <time dateTime="2026-10-12">12. okt 2026</time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
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

          {activeTab === 'personvern' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Dine data og personvern</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Hvordan vi beskytter deg</h3>
                    <div className="mt-2 text-sm text-blue-700 space-y-2">
                      <p>1. Din identitet (BankID) brukes kun til å bekrefte at du er en ekte person og forhindre dobbelstemmer.</p>
                      <p>2. Dine stemmer lagres i en separat, anonymisert database. Ingen kan koble "Navn Nordmann" til en spesifikk stemme.</p>
                      <p>3. All data lagres på sikre servere i Norge/Europa i henhold til GDPR.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button type="button" className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  Slett min profil og all data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
