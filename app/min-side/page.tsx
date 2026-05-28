'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { User, Settings, Bell, Shield, LogOut, FileText, PieChart, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import ValgomatPanel from './valgomat-panel';

function MinSideContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('historikk');
  const { user, loading: isPending, signOut } = useAuth();
  const [voteHistory, setVoteHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [interestCategories, setInterestCategories] = useState<string[]>([]);
  const [emneOptions, setEmneOptions] = useState<string[]>([]);
  const [categoriesSaving, setCategoriesSaving] = useState(false);
  const [notifEmailEnabled, setNotifEmailEnabled] = useState(true);
  const [notifFreq, setNotifFreq] = useState<Record<string, string>>({
    forum: 'realtime',
    mentions: 'realtime',
    categories: 'daily',
  });
  const [notifSaving, setNotifSaving] = useState(false);

  const tabParam = searchParams.get('tab');
  const validTabs = ['historikk', 'innstillinger', 'varsler', 'min-data', 'valgomat'];
  const resolvedTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'historikk';

  useEffect(() => {
    setActiveTab(resolvedTab);
  }, [resolvedTab]);

  useEffect(() => {
    if (!user) {
      setHistoryLoading(false);
      return;
    }

    fetch('/api/user/vote-history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVoteHistory(data);
        }
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/emner')
      .then((res) => res.json())
      .then((json) => {
        const emner = Array.isArray(json.emner) ? json.emner : [];
        const labels = emner
          .filter((e: { er_hovedemne?: boolean }) => e.er_hovedemne)
          .map((e: { navn: string }) => {
            const n = e.navn.toLowerCase();
            return n.charAt(0).toUpperCase() + n.slice(1);
          })
          .sort((a: string, b: string) => a.localeCompare(b, 'no'));
        if (labels.length > 0) setEmneOptions(labels);
      })
      .catch(() => {});

    fetch('/api/notifications/categories', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json.categories)) setInterestCategories(json.categories);
      })
      .catch(() => {});

    fetch('/api/notifications/preferences', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.preferences) {
          if (typeof json.preferences.email_enabled === 'boolean') {
            setNotifEmailEnabled(json.preferences.email_enabled);
          }
          if (json.preferences.email_frequency_by_channel && typeof json.preferences.email_frequency_by_channel === 'object') {
            setNotifFreq((prev) => ({ ...prev, ...json.preferences.email_frequency_by_channel }));
          }
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  if (isPending) {
    return <div className="p-8 text-center text-gray-500">Laster...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
          <User className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Logg inn for å se din profil</h2>
        <p className="text-gray-600">Du må være logget inn for å se din stemmehistorikk, valgomat og innstillinger.</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Logg inn
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="md:flex md:items-center md:justify-between mb-8 text-center md:text-left">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
            Min profil
          </h2>
          <p className="text-sm text-gray-500 mt-2 flex items-center justify-center md:justify-start">
            <Shield className="w-4 h-4 mr-1 text-emerald-500" />
            {user.user_metadata?.full_name || user.email}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 justify-center">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logg ut
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex whitespace-nowrap min-w-max" aria-label="Tabs">
            {[
              { id: 'historikk', icon: FileText, label: 'Mine stemmer' },
              { id: 'valgomat', icon: PieChart, label: 'Valgomat 2.0' },
              { id: 'innstillinger', icon: Settings, label: 'Mine hjertesaker' },
              { id: 'varsler', icon: Bell, label: 'Varsler' },
              { id: 'min-data', icon: Shield, label: 'Privacy Hub' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                } flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'historikk' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Siste stemmer</h3>
              {historyLoading ? (
                <div className="text-center py-8 text-gray-500">Laster stemmehistorikk...</div>
              ) : voteHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-medium">Ingen stemmer ennå</p>
                  <p className="text-sm mt-2">Utforsk saker og stem for å se historikken din her.</p>
                  <Link href="/utforsk" className="mt-4 inline-block text-indigo-600 font-medium hover:text-indigo-500">
                    Utforsk saker →
                  </Link>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                  <ul role="list" className="divide-y divide-gray-200">
                    {voteHistory.map((item) => (
                      <li key={item.stortinget_issue_id}>
                        <Link href={`/sak/${item.stortinget_issue_id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {item.title || `Sak ${item.stortinget_issue_id}`}
                              </p>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Stemt: {new Date(item.voted_at).toLocaleDateString('nb-NO')}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'valgomat' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Valgomat 2.0</h3>
                <p className="text-gray-500">
                  {voteHistory.length > 0
                    ? `Basert på dine ${voteHistory.length} stemmer. Stem på flere saker for bedre nøyaktighet.`
                    : 'Stem på saker for å se hvilke partier du er mest enig med.'}
                </p>
              </div>
              
              {voteHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Du må stemme på minst noen saker for å se din Valgomat.</p>
                  <Link href="/utforsk" className="mt-4 inline-block text-indigo-600 font-medium hover:text-indigo-500">
                    Utforsk saker →
                  </Link>
                </div>
              ) : (
                <ValgomatPanel />
              )}
            </div>
          )}

          {activeTab === 'innstillinger' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Interesseområder</h3>
              <p className="text-sm text-gray-500">Velg hvilke saksområder du ønsker å følge ekstra nøye med på.</p>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {(emneOptions.length > 0
                  ? emneOptions
                  : ['Helse og omsorg', 'Energi og miljø', 'Utdanning og forskning', 'Transport', 'Næring', 'Justis']
                ).map((cat) => (
                  <label key={cat} className="relative flex items-start py-4 px-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <div className="min-w-0 flex-1 text-sm">
                      <span className="font-medium text-gray-900">{cat}</span>
                    </div>
                    <div className="ml-3 flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={interestCategories.includes(cat)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...new Set([...interestCategories, cat])]
                            : interestCategories.filter((c) => c !== cat);
                          setInterestCategories(next);
                        }}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                  </label>
                ))}
              </div>

              <div>
                <button
                  type="button"
                  onClick={async () => {
                    setCategoriesSaving(true);
                    try {
                      await fetch('/api/notifications/categories', {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ categories: interestCategories }),
                      });
                    } finally {
                      setCategoriesSaving(false);
                    }
                  }}
                  disabled={categoriesSaving}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {categoriesSaving ? 'Lagrer…' : 'Lagre interesseområder'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'varsler' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Varslingsinnstillinger</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">E-postvarsler</h4>
                    <p className="text-sm text-gray-500">Slå av/på e-postvarsler. In-app varsler påvirkes ikke.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifEmailEnabled((v) => !v)}
                    className={`${notifEmailEnabled ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200`}
                    role="switch"
                    aria-checked={notifEmailEnabled}
                  >
                    <span
                      aria-hidden="true"
                      className={`${notifEmailEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { key: 'forum', label: 'Forum' },
                    { key: 'mentions', label: 'Mentions' },
                    { key: 'categories', label: 'Kategorier/hjertesaker' },
                  ].map((row) => (
                    <div key={row.key} className="rounded-xl border border-gray-200 p-4 bg-white">
                      <div className="text-sm font-medium text-gray-900 mb-2">{row.label}</div>
                      <select
                        value={notifFreq[row.key] || 'daily'}
                        onChange={(e) => setNotifFreq((prev) => ({ ...prev, [row.key]: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="realtime">Sanntid</option>
                        <option value="daily">Daglig</option>
                        <option value="weekly">Ukentlig</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      setNotifSaving(true);
                      try {
                        await fetch('/api/notifications/preferences', {
                          method: 'POST',
                          headers: { 'content-type': 'application/json' },
                          body: JSON.stringify({
                            email_enabled: notifEmailEnabled,
                            email_frequency_by_channel: notifFreq,
                          }),
                        });
                      } finally {
                        setNotifSaving(false);
                      }
                    }}
                    disabled={notifSaving}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {notifSaving ? 'Lagrer…' : 'Lagre varslingsinnstillinger'}
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
                        <p>1. Din identitet brukes kun til å bekrefte at du er en ekte person og forhindre dobbelstemmer.</p>
                        <p>2. Dine stemmer lagres i en separat, anonymisert database. Ingen kan koble ditt navn til en spesifikk stemme.</p>
                        <p>3. All data lagres på sikre servere i henhold til GDPR (Privacy by Design).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Slett historikk og data</h3>
                <p className="text-sm text-gray-500 mb-6">
                  I tråd med norsk lov og GDPR har du rett til å bli glemt.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50">
                    <div>
                      <h4 className="text-sm font-medium text-red-900">Slett profil og all data</h4>
                      <p className="text-xs text-red-700 mt-1">Sletter profilen din, innstillinger og all stemmehistorikk permanent.</p>
                    </div>
                    <button 
                      type="button" 
                      className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
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
