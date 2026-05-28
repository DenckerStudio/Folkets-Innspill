import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, MessageSquare, ExternalLink } from 'lucide-react';
import { getHoringDetail, getHoringsinnspill, getHoringsprogram } from '@/lib/stortinget';
import { parseStortingetDotNetDateToISO } from '@/lib/stortinget-utils';
import HearingCommentForm from './comment-form';
import HearingUserComments from './hearing-user-comments';

export const dynamic = 'force-dynamic';

function parseHoringDate(raw: string | undefined): string | null {
  if (!raw) return null;
  if (raw.includes('Date')) {
    const iso = parseStortingetDotNetDateToISO(raw);
    if (iso) {
      const d = new Date(iso);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    }
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return null;
}

function isHoringOpen(horing: {
  horing_status?: string;
  anmodningsfrist_dato_tid?: string;
  innspillsfrist?: string;
}) {
  const status = horing.horing_status ?? '';
  if (['Avholdt', 'Avlyst'].includes(status)) return false;
  const frist = horing.anmodningsfrist_dato_tid ?? horing.innspillsfrist;
  if (frist) {
    const match = String(frist).match(/\/Date\((\d+)/);
    const ms = match ? parseInt(match[1], 10) : new Date(frist).getTime();
    if (!isNaN(ms) && ms < Date.now()) return false;
  }
  return ['Planlagt', 'Pågår', 'Påbegynt', 'Planlagt med forbehold'].some((s) => status.includes(s)) || status === '';
}

async function getHoringPageData(id: string) {
  const horing = await getHoringDetail(id);
  if (!horing) return null;

  const [program, offisielleInnspill] = await Promise.all([
    getHoringsprogram(id),
    getHoringsinnspill(id),
  ]);

  const sakInfo = horing.horing_sak_info_liste?.[0];
  const tittel = sakInfo?.sak_tittel || sakInfo?.sak_korttittel || 'Høring';
  const frist = parseHoringDate(horing.anmodningsfrist_dato_tid ?? horing.innspillsfrist);
  const komiteNavn = horing.komite?.navn ?? 'Ukjent komité';

  return {
    id: String(horing.id),
    title: tittel,
    status: horing.horing_status ?? 'Ukjent',
    komiteNavn,
    frist,
    isOpen: isHoringOpen(horing),
    sakId: sakInfo?.sak_id ? String(sakInfo.sak_id) : null,
    sakHenvisning: sakInfo?.sak_henvisning ?? null,
    program,
    offisielleInnspill: (offisielleInnspill || []).slice(0, 20),
    tidspunkter: horing.horingstidspunkt_liste ?? [],
  };
}

export default async function HoringDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hearing = await getHoringPageData(id);

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
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              hearing.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {hearing.status}
          </span>
          <span className="text-sm text-gray-500">{hearing.komiteNavn}</span>
          {hearing.frist && (
            <span className="text-gray-500 font-medium flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2" />
              Frist: {hearing.frist}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">{hearing.title}</h1>

        {hearing.sakId && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            {hearing.sakHenvisning && (
              <p className="text-sm text-gray-600 mb-2">{hearing.sakHenvisning}</p>
            )}
            <Link href={`/sak/${hearing.sakId}`} className="text-indigo-600 hover:text-indigo-500 font-medium text-sm">
              Se relatert stortingssak og stem →
            </Link>
          </div>
        )}

        {hearing.tidspunkter.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Tid og sted</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              {hearing.tidspunkter.map((t: { tidspunkt?: string; sted?: string }, i: number) => (
                <li key={i}>
                  {t.tidspunkt && parseHoringDate(t.tidspunkt)} — {t.sted}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hearing.program?.horingsprogram_liste?.[0] && (
          <div className="prose prose-sm max-w-none mb-6">
            <h2 className="text-lg font-bold text-gray-900">Høringsprogram</h2>
            <p className="text-gray-700">{hearing.program.horingsprogram_liste[0].innledning}</p>
            {hearing.program.horingsprogram_liste[0].merknad && (
              <p className="text-sm text-gray-500">{hearing.program.horingsprogram_liste[0].merknad}</p>
            )}
          </div>
        )}

        <a
          href={`https://www.stortinget.no`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Kilde: Stortinget (høring {hearing.id})
        </a>
      </div>

      {hearing.offisielleInnspill.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            Offisielle høringsinnspill ({hearing.offisielleInnspill.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {hearing.offisielleInnspill.map((innspill: { id?: string; tittel?: string; avsender?: string }, i: number) => (
              <div key={innspill.id ?? i} className="bg-white border border-gray-100 rounded-xl p-4 text-sm">
                <div className="font-medium text-gray-900">{innspill.tittel || innspill.avsender || 'Innspill'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Dine innspill</h2>
        <HearingUserComments stortingetHoringId={hearing.id} />
        <HearingCommentForm stortingetHoringId={hearing.id} isOpen={hearing.isOpen} />
      </div>
    </div>
  );
}
