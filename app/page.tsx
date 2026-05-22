import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, ShieldCheck, Info } from 'lucide-react';
import { getSaker } from '@/lib/stortinget';
import { formatNumber } from '@/lib/utils';
import FadeIn from '@/components/fade-in';
import HeroSection from '@/components/hero-section';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const issues = await getSaker();
  const topIssues = issues.slice(0, 3);

  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <HeroSection />

      {/* Features */}
      <FadeIn delay={0.2} direction="up">
        <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Verifisert & Sikkert</h3>
          <p className="mt-2 text-base text-gray-500">
            Sikker innlogging sikrer &quot;én person, én stemme&quot;. Din identitet er beskyttet, og stemmen din lagres anonymt.
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
      </FadeIn>

      {/* Trending Issues */}
      <FadeIn delay={0.3} direction="up">
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Aktuelle saker nå</h2>
          <Link href="/utforsk" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
            Se alle <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {topIssues.map((issue: any) => {
            const forPercent = Math.round((issue.votes.for / issue.votes.total) * 100) || 0;
            const againstPercent = Math.round((issue.votes.against / issue.votes.total) * 100) || 0;

            return (
              <Link key={issue.id} href={`/sak/${issue.id}`} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
                <div className="p-6 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {issue.category}
                    </span>
                    <span className="text-sm text-gray-500">Votering: {issue.date}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    {issue.summary}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1.5" />
                    {formatNumber(issue.votes.total)} har stemt
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col gap-3 mt-auto">
                   <div className="flex gap-1 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-emerald-500" style={{ width: `${forPercent}%` }}></div>
                      <div className="bg-rose-500" style={{ width: `${againstPercent}%` }}></div>
                   </div>
                   <div className="flex justify-between items-center w-full">
                     <span className="text-xs font-medium text-gray-500">{forPercent}% For</span>
                     <span className="text-indigo-600 text-sm font-medium flex items-center group-hover:text-indigo-700">
                       Les mer <ArrowRight className="ml-1 w-4 h-4" />
                     </span>
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      </FadeIn>
    </div>
  );
}
