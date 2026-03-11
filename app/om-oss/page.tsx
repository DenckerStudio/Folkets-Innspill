import { Info, Shield, Database, Lock } from 'lucide-react';

export default function OmOssPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Om Folkets Stemme
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          En uavhengig plattform bygget for å styrke demokratiet ved å gi innbyggerne en direkte, verifisert stemme i løpende politiske saker.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vår misjon</h2>
        <div className="prose prose-indigo max-w-none text-gray-600">
          <p className="text-lg leading-relaxed">
            Demokratiet stopper ikke på valgdagen. Mellom valgene fattes det tusenvis av beslutninger på Stortinget som påvirker hverdagen vår. 
            Folkets Stemme ble skapt for å tette gapet mellom politikerne og folket i disse periodene.
          </p>
          <p className="text-lg leading-relaxed mt-4">
            Vi tror at hvis politikere får tilgang til reell, verifisert statistikk over hva velgerne deres faktisk mener om konkrete saker, 
            vil det føre til bedre og mer representative beslutninger. Samtidig gir det innbyggerne en følelse av å bli hørt.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">1. Data fra kilden</h3>
          <p className="text-gray-600">
            Vi henter alle saker, forslag og voteringer direkte og ufiltrert fra Stortingets åpne API (data.stortinget.no).
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">2. Sikker verifisering</h3>
          <p className="text-gray-600">
            Brukere logger inn med BankID. Dette sikrer at plattformen er fri for botter, troll og falske kontoer. Én person, én stemme.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <Info className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">3. Anonym innsikt</h3>
          <p className="text-gray-600">
            Når du stemmer, kobles stemmen fra din identitet. Politikere ser kun aggregerte trender (f.eks. aldersgrupper i et fylke).
          </p>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-200">
        <div className="flex items-center mb-6">
          <Lock className="w-8 h-8 text-indigo-600 mr-4" />
          <h2 className="text-2xl font-bold text-gray-900">Personvern og sikkerhet (GDPR)</h2>
        </div>
        
        <div className="space-y-6 text-gray-600">
          <p>
            Å lagre politiske meninger innebærer behandling av sensitive personopplysninger. Vi tar dette på største alvor og bygger plattformen etter prinsippet om <strong>innebygd personvern (Privacy by Design)</strong>.
          </p>
          
          <ul className="list-disc pl-5 space-y-3">
            <li><strong>Dataminimering:</strong> Vi lagrer kun det som er strengt nødvendig for å verifisere at du har stemmerett i Norge.</li>
            <li><strong>Anonymisering:</strong> I det øyeblikket du avgir en stemme, lagres den i en separat database uten kobling til ditt navn eller fødselsnummer.</li>
            <li><strong>Norsk lagring:</strong> All data lagres på servere fysisk plassert i Norge eller EU/EØS. Ingen data sendes til tredjeland.</li>
            <li><strong>Sletting:</strong> Du kan når som helst slette din profil og all tilknyttet historikk med ett klikk.</li>
          </ul>
        </div>
      </div>

      {/* FAQ / Contact */}
      <div className="text-center pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Har du spørsmål?</h2>
        <p className="text-gray-600 mb-6">
          Vi er under utvikling og tar gjerne imot tilbakemeldinger fra både innbyggere og politikere.
        </p>
        <a href="mailto:kontakt@folketsstemme.no" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Kontakt oss
        </a>
      </div>
    </div>
  );
}
