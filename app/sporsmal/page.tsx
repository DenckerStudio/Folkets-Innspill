import FadeIn from '@/components/fade-in';
import { STORTINGET_ACTIVE_SESSION_ID } from '@/lib/stortinget-config';
import { headers } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type SporsmalType = 'sporretimesporsmal' | 'interpellasjoner' | 'skriftligesporsmal';

type ApiResponse = {
  type: SporsmalType;
  sesjonId: string;
  status: string | null;
  sporsmal: any[];
};

function typeLabel(t: SporsmalType) {
  if (t === 'sporretimesporsmal') return 'Spørretimespørsmål';
  if (t === 'interpellasjoner') return 'Interpellasjoner';
  return 'Skriftlige spørsmål';
}

export default async function SporsmalPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; sesjonId?: string }>;
}) {
  const sp = await searchParams;
  const type: SporsmalType =
    sp.type === 'interpellasjoner' || sp.type === 'skriftligesporsmal' || sp.type === 'sporretimesporsmal'
      ? sp.type
      : 'skriftligesporsmal';
  const sesjonId = sp.sesjonId || STORTINGET_ACTIVE_SESSION_ID;
  const status = sp.status || 'alle';

  const qs = new URLSearchParams({ type, sesjonId });
  if (status) qs.set('status', status);

  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'http';
  const baseUrl = host ? `${proto}://${host}` : '';

  const res = await fetch(`${baseUrl}/api/sporsmal?${qs.toString()}`, { cache: 'no-store' });
  const data = (res.ok ? ((await res.json()) as ApiResponse) : null) ?? {
    type,
    sesjonId,
    status: status || null,
    sporsmal: [],
  };

  return (
    <div className="space-y-8 pb-12">
      <FadeIn delay={0.1}>
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">Spørsmål</h1>
          <p className="text-gray-600 mt-3">
            Lister spørsmål fra sesjonen <span className="font-semibold">{data.sesjonId}</span>.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} direction="up">
        <div className="flex flex-wrap gap-2">
          {(['skriftligesporsmal', 'sporretimesporsmal', 'interpellasjoner'] as SporsmalType[]).map((t) => {
            const active = t === data.type;
            const href = `/sporsmal?${new URLSearchParams({
              type: t,
              sesjonId: data.sesjonId,
              ...(status ? { status } : {}),
            }).toString()}`;
            return (
              <a
                key={t}
                href={href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {typeLabel(t)}
              </a>
            );
          })}
        </div>
      </FadeIn>

      <FadeIn delay={0.25} direction="up">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">{data.sporsmal.length} treff</div>
            {data.status && <div className="text-xs text-gray-400">status={data.status}</div>}
          </div>
          <div className="divide-y divide-gray-100">
            {data.sporsmal.slice(0, 200).map((q, idx) => (
              <Link
                key={q.id ?? idx}
                href={q.id ? `/sporsmal/${q.id}` : '#'}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-semibold text-gray-900">{q.tittel || q.sporsmal || `Spørsmål ${q.id ?? ''}`}</div>
                <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                  {q.id && <span className="font-mono">id={q.id}</span>}
                  {q.type && <span>type={q.type}</span>}
                  {q.status && <span>status={q.status}</span>}
                  {q.sendt_dato && <span>sendt={String(q.sendt_dato).slice(0, 10)}</span>}
                </div>
              </Link>
            ))}
            {data.sporsmal.length > 200 && (
              <div className="px-6 py-4 text-xs text-gray-500">Viser første 200 for ytelse.</div>
            )}
            {data.sporsmal.length === 0 && <div className="px-6 py-10 text-sm text-gray-500">Ingen data.</div>}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

