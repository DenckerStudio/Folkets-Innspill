import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getSakDetail } from '@/lib/stortinget';

export const dynamic = 'force-dynamic';

const MAX_SOURCE_CHARS = 8000;

function buildPromptSource(input: {
  title?: string | null;
  summary?: string | null;
  detail?: any | null;
}): { title: string; description: string } {
  const title = input.title || input.detail?.korttittel || input.detail?.tittel || 'Ukjent sak';

  const parts: string[] = [];
  if (input.summary) parts.push(input.summary);
  if (input.detail?.tittel && input.detail.tittel !== input.summary) parts.push(input.detail.tittel);
  if (input.detail?.innstillingstekst) parts.push(input.detail.innstillingstekst);
  if (input.detail?.kortvedtak) parts.push(input.detail.kortvedtak);
  if (input.detail?.vedtakstekst) parts.push(input.detail.vedtakstekst);
  if (input.detail?.parentestekst) parts.push(input.detail.parentestekst);

  const description = (parts.filter(Boolean).join('\n\n') || title).slice(0, MAX_SOURCE_CHARS);
  return { title, description };
}

async function generateSummary(
  title: string,
  description: string
): Promise<{ hva: string; hvem: string; kostnad: string }> {
  const systemPrompt = `Du er en nøytral, lokal AI-assistent for "Folkets Stemme".
Din oppgave er å forenkle følgende stortingssak for vanlige borgere.
Sakstittel: ${title}
Beskrivelse: ${description}

Svar KUN med et JSON-objekt med følgende nøkler:
"hva": Kort forklart, hva handler saken om? (maks 2 setninger)
"hvem": Hvem påvirkes direkte av dette? (maks 2 setninger)
"kostnad": Hva er den antatte økonomiske kostnaden eller konsekvensen? (maks 2 setninger)
Svar på norsk.`;

  const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL;
  let responseText = '{}';

  if (!ollamaUrl) {
    throw new Error('Ollama not configured (NEXT_PUBLIC_OLLAMA_URL missing)');
  }

  const res = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'llama3',
      prompt: systemPrompt,
      stream: false,
      format: 'json',
    }),
  });
  if (!res.ok) throw new Error(`Ollama request failed: ${res.status}`);
  const jsonRes = await res.json();
  responseText = jsonRes.response || '{}';

  if (responseText.startsWith('```json')) {
    responseText = responseText.replace(/```json\n?/, '').replace(/```$/, '');
  } else if (responseText.startsWith('```')) {
    responseText = responseText.replace(/```\n?/, '').replace(/```$/, '');
  }

  return JSON.parse(responseText);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const service = getServiceSupabase();

  const { data: cached } = await service
    .from('stortinget_issues')
    .select('ai_summary_json, ai_summary_generated_at, title, summary')
    .eq('id', id)
    .maybeSingle();

  if (cached?.ai_summary_json) {
    return NextResponse.json({
      ...cached.ai_summary_json,
      cached: true,
      generated_at: cached.ai_summary_generated_at,
    });
  }

  const detail = await getSakDetail(id).catch(() => null);
  const { title, description } = buildPromptSource({ title: cached?.title, summary: cached?.summary, detail });

  try {
    const summary = await generateSummary(title, description);

    await service.from('stortinget_issues').upsert(
      {
        id,
        title,
        summary: cached?.summary ?? (detail?.tittel || null),
        detail_json: detail ?? null,
        last_synced_at: new Date().toISOString(),
        ai_summary_json: summary,
        ai_summary_generated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    return NextResponse.json({ ...summary, cached: false });
  } catch (e) {
    console.error('AI summary generation failed:', e);
    return NextResponse.json(
      {
        hva: 'Kunne ikke generere sammendrag for øyeblikket.',
        hvem: 'Ukjent',
        kostnad: 'Ukjent',
        error: true,
        retry_after_seconds: 10,
      },
      { status: 503 }
    );
  }
}
