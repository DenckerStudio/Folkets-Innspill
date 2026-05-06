import Link from 'next/link';
import { FileEdit, Search, Users, ThumbsUp, ThumbsDown, Clock, MousePointer2 } from 'lucide-react';
import FadeIn from '@/components/fade-in';

export const dynamic = 'force-dynamic';

const mockHearings = [
  {
    id: 'h1',
    title: 'Utkast til ny Opplæringslov (Kjerneelementer)',
    department: 'Kunnskapsdepartementet',
    status: 'Åpen for innspill',
    deadline: '24. Mai 2026',
    participants: 1204,
    comments: 432
  },
  {
    id: 'h2',
    title: 'Forslag til endringer i Arbeidsmiljøloven vedr hjemmekontor',
    department: 'Arbeids- og inkluderingsdepartementet',
    status: 'Åpen for innspill',
    deadline: '12. Juni 2026',
    participants: 3450,
    comments: 1205
  },
  {
    id: 'h3',
    title: 'Klimaplan for transportsektoren 2027-2035',
    department: 'Samferdselsdepartementet',
    status: 'Lukket - Under behandling',
    deadline: 'Gikk ut for 3 dager siden',
    participants: 8400,
    comments: 4230
  }
];

export default function HoringerPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <FadeIn delay={0.1}>
        <div className="bg-white p-8 md:p-12 border-b border-gray-200 shadow-sm text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Interaktive Høringsrunder</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Samskaping i praksis. Her kan du lese, kommentere og markere spesifikke avsnitt i lovforslag direkte - lenge før de vedtas. Vær med å forme politikken!
          </p>
        </div>
      </FadeIn>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mest aktive lovforslag</h2>
          </div>

          <div className="space-y-4">
            {mockHearings.map((hearing, index) => (
              <FadeIn key={hearing.id} delay={0.1 * index} direction="up">
                <Link href={`/horinger/${hearing.id}`} className="block bg-white p-6 border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${hearing.status.includes('Åpen') ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {hearing.status}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">Frist: {hearing.deadline}</span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {hearing.title}
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-wider">
                        {hearing.department}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-6">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                          {hearing.participants} deltakere
                        </span>
                        <span className="flex items-center">
                          <MousePointer2 className="w-4 h-4 mr-1.5 text-gray-400" />
                          {hearing.comments} markeringer
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-6">
           <FadeIn delay={0.3} direction="left">
             <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center">
                  <FileEdit className="w-5 h-5 mr-2" />
                  Slik fungerer det
                </h3>
                <p className="text-sm text-indigo-800 mb-4 leading-relaxed">
                  Tradisjonelt er høringsrunder forbeholdt store organisasjoner og bedrifter som leverer titalls sider med formelle svar.
                </p>
                <div className="space-y-3 text-sm text-indigo-800 font-medium">
                  <div className="flex items-start">
                    <span className="bg-indigo-200 text-indigo-900 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">1</span>
                    Les utkast til lovtekst
                  </div>
                  <div className="flex items-start">
                    <span className="bg-indigo-200 text-indigo-900 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">2</span>
                    Marker setninger du liker (<span className="text-emerald-600 mx-1">Grønt</span>) eller misliker (<span className="text-rose-600 mx-1">Rødt</span>)
                  </div>
                  <div className="flex items-start">
                    <span className="bg-indigo-200 text-indigo-900 rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">3</span>
                    Legg igjen konkrete endringsforslag i margen
                  </div>
                </div>
             </div>
           </FadeIn>
        </div>
      </div>
    </div>
  );
}
