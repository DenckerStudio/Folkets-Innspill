import Link from 'next/link';
import { ArrowRight, FileText, Search, Clock, Users } from 'lucide-react';
import { FadeIn } from '@/components/animations/fade-in';

async function getHoringer() {
  try {
    const res = await fetch('http://localhost:3000/api/horinger', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await res.json();
    return data.horinger_liste || [];
  } catch (error) {
    console.error('Error fetching horinger:', error);
    return [];
  }
}

export default async function HoringerPage() {
  const realHearings = await getHoringer();
  
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="bg-white p-8 md:p-12 border border-blue-100 shadow-sm rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#00205b] mb-4 tracking-tight">Høringer</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
            Se alle nåværende og nyligste høringer fra Stortinget. Her kan du si din mening før beslutninger blir tatt.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Søk i høringer..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
        <select className="block w-full md:w-auto pl-3 pr-10 py-3 text-base border-gray-200 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl">
          <option>Alle statuser</option>
          <option>Åpen for innspill</option>
          <option>Under behandling</option>
        </select>
        <select className="block w-full md:w-auto pl-3 pr-10 py-3 text-base border-gray-200 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl">
          <option>Alle departement/komiteer</option>
          <option>Arbeids- og sosialkomiteen</option>
          <option>Finanskomiteen</option>
        </select>
      </div>

      <div className="grid gap-6">
        {realHearings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Klarte ikke å hente høringer. Prøv igjen senere.
          </div>
        ) : (
          realHearings.map((hearing: any) => {
            const isAvholdt = hearing.horing_status === 'Avholdt';
            const komiteNavn = hearing.komite?.navn || 'Ukjent komité';
            const tittel = hearing.horing_sak_info_liste?.[0]?.sak_tittel || 'Høring uten tittel';
            // Parsing the weird /Date(123456789+0200)/ format if we want, but let's just use raw or safe text
            const anmodFristRaw = hearing.innspillsfrist || hearing.anmodningsfrist_dato_tid;
            let fristText = 'Ukjent frist';
            if (anmodFristRaw && anmodFristRaw.includes('Date')) {
              const ms = parseInt(anmodFristRaw.match(/\d+/)[0], 10);
              const d = new Date(ms);
              if (!isNaN(d.getTime())) {
                fristText = d.toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' });
              }
            }
            
            return (
              <div 
                key={hearing.id} 
                className="bg-white border text-left border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-[#ba0c2f] transition-colors"></div>
                <div className="flex-1 pl-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${!isAvholdt ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                      {hearing.horing_status || 'Ukjent status'}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      {komiteNavn}
                    </span>
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
    </div>
  );
}
