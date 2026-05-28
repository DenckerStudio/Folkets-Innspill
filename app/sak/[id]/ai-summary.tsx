'use client';

import { ShieldCheck, BrainCircuit, Users, Coins, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface SummaryData {
  hva: string;
  hvem: string;
  kostnad: string;
  cached?: boolean;
  allApproved?: boolean;
}

export default function AiSummary({ sakId }: { sakId: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      try {
        const res = await fetch(`/api/sak/${sakId}/ai-summary`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Kunne ikke hente sammendrag');
        }

        if (!cancelled) {
          setData({
            hva: json.hva,
            hvem: json.hvem,
            kostnad: json.kostnad,
            cached: json.cached,
            allApproved: json.allApproved,
          });
        }
      } catch (error) {
        console.error('Failed to fetch AI summary', error);
        if (!cancelled) {
          setData({
            hva: 'Kunne ikke generere sammendrag for øyeblikket.',
            hvem: 'Ukjent',
            kostnad: 'Ukjent',
            allApproved: false,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [sakId]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Kort forklart av AI</h2>
        </div>
        <div className="flex items-center gap-2">
          {data?.cached && (
            <span className="text-xs text-gray-500 hidden sm:inline">Lagret sammendrag</span>
          )}
          <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Lokal AI (Norge) - 100% Personvern</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center text-indigo-600 font-medium mb-2">
                <Info className="w-4 h-4 mr-2" />
                Hva er saken?
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{data?.hva}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-amber-600 font-medium mb-2">
                <Users className="w-4 h-4 mr-2" />
                Hvem påvirkes?
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{data?.hvem}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-emerald-600 font-medium mb-2">
                <Coins className="w-4 h-4 mr-2" />
                Hva er kostnaden?
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{data?.kostnad}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
