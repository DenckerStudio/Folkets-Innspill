'use client';

import Link from 'next/link';
import { ArrowRight, Search, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';

type Hearing = {
  id: string | number;
  horing_status?: string;
  komite?: { navn?: string };
  horing_sak_info_liste?: Array<{ sak_tittel?: string }>;
  innspillsfrist?: string;
  anmodningsfrist_dato_tid?: string;
};

function parseFrist(raw: string | undefined): string {
  if (!raw) return 'Ukjent frist';
  if (raw.includes('Date')) {
    const ms = parseInt(raw.match(/\d+/)?.[0] ?? '', 10);
    const d = new Date(ms);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return 'Ukjent frist';
}

export default function HoringerList({
  hearings,
  komiteer,
}: {
  hearings: Hearing[];
  komiteer: Array<{ id: string; navn: string }>;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Alle statuser');
  const [komiteFilter, setKomiteFilter] = useState('Alle komiteer');

  const filtered = useMemo(() => {
    let list = hearings;
    if (statusFilter === 'Åpen for innspill') {
      list = list.filter((h) => !['Avholdt', 'Avlyst'].includes(h.horing_status ?? ''));
    } else if (statusFilter === 'Under behandling') {
      list = list.filter((h) => ['Pågår', 'Påbegynt'].some((s) => (h.horing_status ?? '').includes(s)));
    }
    if (komiteFilter !== 'Alle komiteer') {
      list = list.filter((h) => h.komite?.navn === komiteFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((h) => {
        const tittel = h.horing_sak_info_liste?.[0]?.sak_tittel ?? '';
        return tittel.toLowerCase().includes(q) || String(h.id).includes(q);
      });
    }
    return list;
  }, [hearings, search, statusFilter, komiteFilter]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk i høringer..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full md:w-auto pl-3 pr-10 py-3 text-base border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl"
        >
          <option>Alle statuser</option>
          <option>Åpen for innspill</option>
          <option>Under behandling</option>
        </select>
        <select
          value={komiteFilter}
          onChange={(e) => setKomiteFilter(e.target.value)}
          className="block w-full md:w-auto pl-3 pr-10 py-3 text-base border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl"
        >
          <option>Alle komiteer</option>
          {komiteer.map((k) => (
            <option key={k.id} value={k.navn}>
              {k.navn}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Ingen høringer matcher filteret.</div>
        ) : (
          filtered.map((hearing) => {
            const isAvholdt = hearing.horing_status === 'Avholdt';
            const komiteNavn = hearing.komite?.navn || 'Ukjent komité';
            const tittel = hearing.horing_sak_info_liste?.[0]?.sak_tittel || 'Høring uten tittel';
            const fristText = parseFrist(hearing.innspillsfrist || hearing.anmodningsfrist_dato_tid);

            return (
              <div
                key={hearing.id}
                className="bg-white border text-left border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-[#ba0c2f] transition-colors" />
                <div className="flex-1 pl-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        !isAvholdt ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {hearing.horing_status || 'Ukjent status'}
                    </span>
                    <span className="text-sm font-medium text-gray-500">{komiteNavn}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#00205b] mb-2">{tittel}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-4 md:mb-0 space-x-6">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      Frist: {fristText}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 w-full md:w-auto flex justify-end pl-4">
                  <Link
                    href={`/horinger/${hearing.id}`}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-[#00205b] bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors w-full md:w-auto"
                  >
                    Les og gi innspill
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
