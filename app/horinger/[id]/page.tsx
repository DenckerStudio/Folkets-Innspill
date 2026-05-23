import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users, Clock, MousePointer2 } from 'lucide-react';

const mockHearings = [
  {
    id: 'h1',
    title: 'Utkast til ny Opplæringslov (Kjerneelementer)',
    department: 'Kunnskapsdepartementet',
    status: 'Åpen for innspill',
    deadline: '24. Mai 2026',
    participants: 1204,
    comments: 432,
    content: "Dette er et utkast til ny innhold i opplæringsloven. Formålet med loven er å sikre..."
  },
  {
    id: 'h2',
    title: 'Forslag til endringer i Arbeidsmiljøloven vedr hjemmekontor',
    department: 'Arbeids- og inkluderingsdepartementet',
    status: 'Åpen for innspill',
    deadline: '12. Juni 2026',
    participants: 3450,
    comments: 1205,
    content: "Her fastsettes nye retningslinjer for..."
  },
  {
    id: 'h3',
    title: 'Klimaplan for transportsektoren 2027-2035',
    department: 'Samferdselsdepartementet',
    status: 'Lukket - Under behandling',
    deadline: 'Gikk ut for 3 dager siden',
    participants: 8400,
    comments: 4230,
    content: "Klimaplanens formål..."
  }
];

export default async function HoringDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hearing = mockHearings.find(h => h.id === id);

  if (!hearing) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <Link href="/horinger" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Tilbake til høringer
      </Link>
      
      <div className="bg-white p-8 md:p-12 border border-gray-200 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${hearing.status.includes('Åpen') ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
            {hearing.status}
          </span>
          <span className="text-gray-500 font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Frist: {hearing.deadline}
          </span>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{hearing.title}</h1>
        <p className="text-lg text-gray-500 mb-8 font-medium uppercase tracking-wider">{hearing.department}</p>
        
        <div className="flex items-center space-x-8 pb-8 border-b border-gray-200 mb-8 text-gray-600 font-medium">
          <span className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-500" />
            {hearing.participants} deltakere har gitt innspill
          </span>
          <span className="flex items-center">
            <MousePointer2 className="w-5 h-5 mr-2 text-emerald-500" />
            {hearing.comments} markeringer i tekst
          </span>
        </div>

        <div className="prose prose-lg max-w-none prose-indigo">
          <h3>Høringsnotat</h3>
          <p>{hearing.content}</p>
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mt-8">
            <h4 className="text-indigo-900 mt-0 font-bold">Interaktiv lesingkommer snart...</h4>
            <p className="text-indigo-800 mb-0">Vi utvikler et verktøy som lar deg markere og kommentere direkte i lovteksten. Denne funksjonen vil gjøres tilgjengelig i fase 2 av prosjektet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
