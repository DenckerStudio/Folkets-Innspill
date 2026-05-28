import { GoogleGenAI } from '@google/genai';

function stripMarkdownJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n?/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '').replace(/```$/, '');
  }
  return cleaned.trim();
}

export function parseJsonFromLlm<T>(raw: string): T {
  const cleaned = stripMarkdownJson(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Kunne ikke parse JSON fra AI-svar');
    return JSON.parse(match[0]) as T;
  }
}

async function generateWithOllama(prompt: string): Promise<string> {
  const ollamaUrl =
    process.env.OLLAMA_URL || process.env.NEXT_PUBLIC_OLLAMA_URL;
  if (!ollamaUrl) {
    throw new Error('OLLAMA_URL er ikke konfigurert');
  }

  const res = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'llama3',
      prompt,
      stream: false,
      format: 'json',
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama request failed with status ${res.status}`);
  }

  const jsonRes = await res.json();
  return jsonRes.response || '{}';
}

async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY er ikke konfigurert');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  return response.text || '{}';
}

export async function generateLlmJson<T>(prompt: string): Promise<T> {
  const ollamaUrl =
    process.env.OLLAMA_URL || process.env.NEXT_PUBLIC_OLLAMA_URL;
  const raw = ollamaUrl
    ? await generateWithOllama(prompt)
    : await generateWithGemini(prompt);
  return parseJsonFromLlm<T>(raw);
}
