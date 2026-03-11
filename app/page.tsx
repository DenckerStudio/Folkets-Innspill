import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-white rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Din stemme teller.</span>
          <span className="block text-indigo-600">Også mellom valgene.</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Folkets Stemme er en nøytral plattform som brobygger mellom Stortinget og innbyggerne.
          Si din mening om aktuelle saker med verifisert stemmegivning.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link href="/utforsk" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
              Utforsk saker
            </Link>
          </div>
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <Link href="/auth/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
              Logg inn med BankID
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Verifisert & Sikkert</h3>
          <p className="mt-2 text-base text-gray-500">
            Innlogging med BankID sikrer "én person, én stemme". Din identitet er beskyttet, og stemmen din lagres anonymt.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Direkte fra Stortinget</h3>
          <p className="mt-2 text-base text-gray-500">
            Saker hentes automatisk fra Stortingets åpne API. Få med deg hva som faktisk debatteres og vedtas.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-amber-100 text-amber-600 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">For Politikere</h3>
          <p className="mt-2 text-base text-gray-500">
            Politikere får tilgang til anonymisert statistikk for å forstå hva velgerne i deres distrikt mener om konkrete saker.
          </p>
        </div>
      </section>

      {/* Trending Issues (Mock) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Aktuelle saker nå</h2>
          <Link href="/utforsk" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
            Se alle <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Mock Issue 1 */}
          <Link href="/sak/1" className="block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Helse og omsorg
                </span>
                <span className="text-sm text-gray-500">Votering: 15. okt</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Representantforslag om å styrke fastlegeordningen
              </h3>
              <p className="text-gray-600 line-clamp-2 mb-4">
                Forslag fra flere representanter om strakstiltak for å redde fastlegeordningen, inkludert økt basistilskudd og redusert listelengde.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1.5" />
                12 450 har stemt
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
               <div className="flex gap-2 w-full">
                  <div className="h-2 bg-emerald-500 rounded-l-full" style={{ width: '65%' }}></div>
                  <div className="h-2 bg-rose-500 rounded-r-full" style={{ width: '35%' }}></div>
               </div>
            </div>
          </Link>

          {/* Mock Issue 2 */}
          <Link href="/sak/2" className="block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Energi og miljø
                </span>
                <span className="text-sm text-gray-500">Votering: 22. okt</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Utbygging av havvind i Sørlige Nordsjø II
              </h3>
              <p className="text-gray-600 line-clamp-2 mb-4">
                Regjeringens forslag til rammeverk for tildeling av areal og støtteordninger for utbygging av bunnfast havvind.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1.5" />
                8 920 har stemt
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
               <div className="flex gap-2 w-full">
                  <div className="h-2 bg-emerald-500 rounded-l-full" style={{ width: '45%' }}></div>
                  <div className="h-2 bg-rose-500 rounded-r-full" style={{ width: '55%' }}></div>
               </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
