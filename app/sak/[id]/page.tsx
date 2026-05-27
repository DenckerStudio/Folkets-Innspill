import { getSak } from '@/lib/stortinget';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react';
import AiSummary from './ai-summary';
import PoliticianResponseForm from './politician-response-form';
import ShareButton from './share-button';
import FadeIn from '@/components/fade-in';
import ExpandableText from './expandable-text';
import VotingSection from './voting-section';

export const dynamic = 'force-dynamic';

export default async function SakPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const sak = await getSak(resolvedParams.id);

  if (!sak) {
    notFound();
  }

  // Fetch detailed sak content
  let detailedContent = null;
  try {
    const detailRes = await fetch(`https://data.stortinget.no/eksport/sak?sakid=${sak.id}&format=json`, {
      next: { revalidate: 3600 }
    });
    if (detailRes.ok) {
      detailedContent = await detailRes.json();
    }
  } catch (error) {
    console.error("Error fetching detailed sak:", error);
  }

  const innstillingstekst = detailedContent?.innstillingstekst;
  const kortvedtak = detailedContent?.kortvedtak;
  const vedtakstekst = detailedContent?.vedtakstekst;

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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {sak.category}
            </span>
            <span className="text-sm text-gray-500">Sist oppdatert: {sak.date}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{sak.title}</h1>
          
          <div className="prose prose-indigo max-w-none text-gray-700">
            <p className="text-lg leading-relaxed">{sak.summary}</p>
            
            {(innstillingstekst || kortvedtak || vedtakstekst) && (
              <div className="mt-8 space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mt-0">Sakens detaljerte innhold</h2>
                
                {innstillingstekst && (
                  <ExpandableText title="Innstilling" text={innstillingstekst} />
                )}
                
                {kortvedtak && (
                  <ExpandableText title="Kortvedtak" text={kortvedtak} />
                )}

                {vedtakstekst && (
                  <ExpandableText title="Vedtakstekst" text={vedtakstekst} />
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <a
              href={`https://data.stortinget.no/eksport/sak?sakid=${sak.id}&format=json`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
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
        <PoliticianResponseForm sakId={sak.id} />
      </FadeIn>

      {/* Voting Section */}
      <FadeIn delay={0.5} direction="up">
        <VotingSection initialVotes={sak.votes} sakId={sak.id} sakTitle={sak.title} sakSummary={sak.summary} />
      </FadeIn>
    </div>
  );
}
