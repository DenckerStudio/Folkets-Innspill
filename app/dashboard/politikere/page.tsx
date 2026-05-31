import Link from 'next/link';
import { getRepresentanter } from '@/lib/stortinget';
import { getPersonbildeUrl } from '@/lib/stortinget-utils';
import { routes } from '@/lib/routes';
import { ShieldCheck, MapPin, Building2, Search } from 'lucide-react';
import FadeIn from '@/components/fade-in';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const partyLogos: Record<string, string> = {
  'Arbeiderpartiet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Arbeiderpartiet_logo.svg/200px-Arbeiderpartiet_logo.svg.png',
  'Høyre': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/H%C3%B8yre_logo.svg/200px-H%C3%B8yre_logo.svg.png',
  'Senterpartiet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Senterpartiet_logo.svg/200px-Senterpartiet_logo.svg.png',
  'Fremskrittspartiet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Fremskrittspartiet_logo.svg/200px-Fremskrittspartiet_logo.svg.png',
  'Sosialistisk Venstreparti': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sosialistisk_Venstreparti_logo.svg/200px-Sosialistisk_Venstreparti_logo.svg.png',
  'Rødt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/R%C3%B8dt_logo.svg/200px-R%C3%B8dt_logo.svg.png',
  'Venstre': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Venstre_logo.svg/200px-Venstre_logo.svg.png',
  'Kristelig Folkeparti': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Kristelig_Folkeparti_logo.svg/200px-Kristelig_Folkeparti_logo.svg.png',
  'Miljøpartiet De Grønne': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Milj%C3%B8partiet_De_Gr%C3%B8nne_logo.svg/200px-Milj%C3%B8partiet_De_Gr%C3%B8nne_logo.svg.png',
  'Pasientfokus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Pasientfokus_logo.png/200px-Pasientfokus_logo.png',
};

// Helper function to get party colors
const getPartyColor = (partyName: string) => {
  const colors: Record<string, { bg: string, text: string, border: string, icon: string }> = {
    'Arbeiderpartiet': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', icon: 'bg-red-600' },
    'Høyre': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: 'bg-blue-600' },
    'Senterpartiet': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', icon: 'bg-green-600' },
    'Fremskrittspartiet': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', icon: 'bg-indigo-900' },
    'Sosialistisk Venstreparti': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', icon: 'bg-rose-600' },
    'Rødt': { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', icon: 'bg-red-700' },
    'Venstre': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: 'bg-emerald-600' },
    'Kristelig Folkeparti': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', icon: 'bg-yellow-500' },
    'Miljøpartiet De Grønne': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-100', icon: 'bg-lime-600' },
    'Pasientfokus': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', icon: 'bg-orange-500' },
  };
  
  return colors[partyName] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: 'bg-gray-500' };
};

export default async function PolitikerePage() {
  const representanter = await getRepresentanter();

  // Sort by last name
  const sortedRepresentanter = [...representanter].sort((a, b) => 
    a.etternavn.localeCompare(b.etternavn, 'no')
  );

  return (
    <div className="space-y-12 pb-12">
      <FadeIn delay={0.1}>
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-6 tracking-tight">
              Politiker-hub
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Her finner du oversikt over alle stortingsrepresentanter. 
              Verifiserte politikere kan svare direkte på saker og se anonymisert statistikk fra sine velgere.
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} direction="up">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Søk etter navn, parti eller fylke..."
          />
        </div>
        <div className="flex items-center text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-indigo-600 mr-2" />
          <span>{representanter.length} representanter</span>
        </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.3} direction="up">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedRepresentanter.map((rep, index) => {
            const partyColors = getPartyColor(rep.parti.navn);
            
            return (
              <FadeIn key={rep.id} delay={0.1 * Math.min(index, 8)} direction="up">
                <Link
                  href={routes.politiker(String(rep.id))}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex flex-col h-full overflow-hidden"
                >
                  {/* Top accent bar based on party color */}
                  <div className={`h-2 w-full ${partyColors.icon}`}></div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-5">
                      <div className="relative w-14 h-14 rounded-2xl shadow-sm overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform duration-200 bg-gray-50">
                        <Image
                          src={getPersonbildeUrl(rep.id, 'lite', true)}
                          alt={`${rep.fornavn} ${rep.etternavn}`}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                        <div className={`absolute inset-0 ${partyColors.bg} ${partyColors.text} flex items-center justify-center text-xl font-bold opacity-0`}>
                          {rep.fornavn[0]}{rep.etternavn[0]}
                        </div>
                      </div>
                      <div className="flex items-center bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-100 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Verifisert
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                        {rep.fornavn} {rep.etternavn}
                      </h3>
                      <p className="text-sm font-medium text-gray-500">
                        Stortingsrepresentant
                      </p>
                    </div>
                    
                    <div className="mt-auto pt-5 border-t border-gray-50 space-y-3">
                      <div className="flex items-center text-sm">
                        <div className={`w-6 h-6 rounded-full ${partyColors.bg} flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden relative`}>
                          {partyLogos[rep.parti.navn] ? (
                            <Image 
                              src={partyLogos[rep.parti.navn]} 
                              alt={`${rep.parti.navn} logo`}
                              fill
                              className="object-contain p-1"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Building2 className={`w-3.5 h-3.5 ${partyColors.text}`} />
                          )}
                        </div>
                        <span className="font-medium text-gray-700">{rep.parti.navn}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="text-gray-600">{rep.fylke.navn}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </FadeIn>
    </div>
  );
}
