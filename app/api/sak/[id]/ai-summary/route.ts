import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

  if (ollamaUrl) {
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
  } else if (process.env.GEMINI_API_KEY) {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: systemPrompt,
      config: { responseMimeType: 'application/json' },
    });
    responseText = response.text || '{}';
  } else {
    throw new Error('No AI provider configured');
  }

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
    .single();

  if (cached?.ai_summary_json) {
    return NextResponse.json({
      ...cached.ai_summary_json,
      cached: true,
      generated_at: cached.ai_summary_generated_at,
    });
  }

  const title = cached?.title || `Sak ${id}`;
  const description = cached?.summary || title;

  try {
    const summary = await generateSummary(title, description);

    await service
      .from('stortinget_issues')
      .update({
        ai_summary_json: summary,
        ai_summary_generated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({ ...summary, cached: false });
  } catch (e) {
    console.error('AI summary generation failed:', e);
    return NextResponse.json(
      {
        hva: 'Kunne ikke generere sammendrag for øyeblikket.',
        hvem: 'Ukjent',
        kostnad: 'Ukjent',
        error: true,
      },
      { status: 200 }
    );
  }
}
