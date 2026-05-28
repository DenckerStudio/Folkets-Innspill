import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getEnkeltsporsmal } from '@/lib/stortinget';

export const dynamic = 'force-dynamic';

export default async function SporsmalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sporsmal = await getEnkeltsporsmal(id);

  if (!sporsmal) {
    notFound();
  }

  const fra = sporsmal.sporsmal_fra;
  const til = sporsmal.sporsmal_til;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <Link href="/sporsmal" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Tilbake til spørsmål
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-6">
        <div className="flex flex-wrap gap-2 text-xs">
          {sporsmal.type && (
            <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">{sporsmal.type}</span>
          )}
          {sporsmal.status && (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{sporsmal.status}</span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{sporsmal.tittel}</h1>

        <div className="text-sm text-gray-600 space-y-1">
          {fra && (
            <p>
              Fra:{' '}
              {fra.fornavn} {fra.etternavn}
              {fra.parti?.navn ? ` (${fra.parti.navn})` : ''}
            </p>
          )}
          {til && (
            <p>
              Til: {sporsmal.sporsmal_til_minister_tittel || `${til.fornavn} ${til.etternavn}`}
            </p>
          )}
          {sporsmal.besvart_dato && (
            <p>Besvart: {String(sporsmal.besvart_dato).slice(0, 10)}</p>
          )}
        </div>

        {sporsmal.begrunnelse && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Begrunnelse</h2>
            <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: sporsmal.begrunnelse }} />
          </div>
        )}

        {sporsmal.sporsmal && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Spørsmål</h2>
            <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: sporsmal.sporsmal }} />
          </div>
        )}

        {sporsmal.svar && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Svar</h2>
            <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: sporsmal.svar }} />
          </div>
        )}
      </div>
    </div>
  );
}
