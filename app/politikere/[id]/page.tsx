import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Building2 } from 'lucide-react';
import Image from 'next/image';
import { getKodetBiografi, getPerson, getRepresentanter } from '@/lib/stortinget';
import { getPersonbildeUrl } from '@/lib/stortinget-utils';

export const dynamic = 'force-dynamic';

export default async function PolitikerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [person, biografi, representanter] = await Promise.all([
    getPerson(id),
    getKodetBiografi(id),
    getRepresentanter(),
  ]);

  const representant = representanter.find((r) => r.id === id);

  if (!person && !representant) {
    notFound();
  }

  const navn = representant
    ? `${representant.fornavn} ${representant.etternavn}`
    : person
      ? `${person.fornavn} ${person.etternavn}`
      : id;

  const perioder = biografi?.stortingsperiode_kodet_liste ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <Link href="/politikere" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Tilbake til politikere
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
            <Image src={getPersonbildeUrl(id, 'middels', true)} alt={navn} fill className="object-cover" sizes="96px" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{navn}</h1>
            {representant && (
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {representant.parti.navn}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {representant.fylke.navn}
                </p>
              </div>
            )}
          </div>
        </div>

        {perioder.length > 0 && (
          <div className="px-8 pb-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stortingsperioder</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {perioder.map((p: { stortingsperiode_id?: string; fylke?: string; verv?: string; fra_dato?: string; til_dato?: string }, i: number) => (
                <li key={i} className="flex flex-wrap gap-x-2">
                  <span className="font-medium">{p.stortingsperiode_id}</span>
                  {p.fylke && <span>· {p.fylke}</span>}
                  {p.verv && <span>· {p.verv}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {biografi?.utdanning_yrke_kodet_liste?.length > 0 && (
          <div className="px-8 pb-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Utdanning og yrke</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              {biografi.utdanning_yrke_kodet_liste.slice(0, 8).map((u: { type?: string; tekst?: string }, i: number) => (
                <li key={i}>{u.tekst || u.type}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
