import { getSak } from '@/lib/stortinget';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react';
import AiSummary from './ai-summary';
import PoliticianResponseForm from './politician-response-form';
import ShareButton from './share-button';
import FadeIn from '@/components/fade-in';
import VotingSection from './voting-section';

export const dynamic = 'force-dynamic';

export default async function SakPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sak = await getSak(resolvedParams.id);

  if (!sak) {
    notFound();
  }

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
        <VotingSection initialVotes={sak.votes} sakId={sak.id} />
      </FadeIn>
    </div>
  );
}
