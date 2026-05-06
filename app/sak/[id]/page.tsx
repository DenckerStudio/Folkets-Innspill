import { getSak } from '@/lib/stortinget';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown, Minus, ShieldCheck, MessageSquare } from 'lucide-react';
import AiSummary from './ai-summary';
import PoliticianResponseForm from './politician-response-form';
import ShareButton from './share-button';
import FadeIn from '@/components/fade-in';

export const dynamic = 'force-dynamic';

export default async function SakPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sak = await getSak(resolvedParams.id);

  if (!sak) {
    notFound();
  }

  const forPercent = Math.round((sak.votes.for / sak.votes.total) * 100) || 0;
  const againstPercent = Math.round((sak.votes.against / sak.votes.total) * 100) || 0;
  const abstainPercent = Math.round((sak.votes.abstain / sak.votes.total) * 100) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <FadeIn delay={0.1}>
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Tilbake til oversikt
          </Link>
          <div className="flex gap-3">
            <Link href={`/forum?sak=${sak.id}`} className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
              <MessageSquare className="mr-1.5 w-4 h-4" />
              Diskuter i forum
            </Link>
            <ShareButton id={sak.id} title={sak.title} />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} direction="up">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {sak.category}
            </span>
            <span className="text-sm text-gray-500">Sist oppdatert: {sak.date}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{sak.title}</h1>
          <p className="text-lg text-gray-600 leading-relaxed">{sak.summary}</p>
          <div className="pt-2">
            <a
              href={`https://data.stortinget.no/eksport/saker?stortingssesjonid=2025-2026&format=json`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="mr-1.5 w-4 h-4" />
              Kilde: data.stortinget.no (Sak ID: {sak.id})
            </a>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.3} direction="up">
        <AiSummary title={sak.title} summary={sak.summary} />
      </FadeIn>

      {/* Politician Response Form */}
      <FadeIn delay={0.4} direction="up">
        <PoliticianResponseForm />
      </FadeIn>

      {/* Voting Section */}
      <FadeIn delay={0.5} direction="up">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Hva mener du?</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200 transition-colors">
            <ThumbsUp className="w-8 h-8 mb-2" />
            <span className="font-semibold">For</span>
          </button>
          <button className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-200 transition-colors">
            <Minus className="w-8 h-8 mb-2" />
            <span className="font-semibold">Avstår</span>
          </button>
          <button className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-200 transition-colors">
            <ThumbsDown className="w-8 h-8 mb-2" />
            <span className="font-semibold">Mot</span>
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider text-center">Folkets mening hittil</h3>
          <div className="h-4 flex rounded-full overflow-hidden bg-gray-100">
            <div style={{ width: `${forPercent}%` }} className="bg-emerald-500" title={`For: ${forPercent}%`}></div>
            <div style={{ width: `${abstainPercent}%` }} className="bg-gray-400" title={`Avstår: ${abstainPercent}%`}></div>
            <div style={{ width: `${againstPercent}%` }} className="bg-rose-500" title={`Mot: ${againstPercent}%`}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 font-medium">
            <span className="text-emerald-600">{forPercent}% For</span>
            <span className="text-gray-500">{abstainPercent}% Avstår</span>
            <span className="text-rose-600">{againstPercent}% Mot</span>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Din stemme lagres anonymt (hashing av BankID) i tråd med GDPR.
          </p>
        </div>
      </div>
      </FadeIn>
    </div>
  );
}
