import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import {
  extractJsonMiddleware,
  wrapLanguageModel,
  type LanguageModel,
} from 'ai';
import type { FetchFunction } from '@ai-sdk/provider-utils';

const OLLAMA_FETCH_TIMEOUT_MS = 180_000;

function ollamaBaseUrl(): string | null {
  const raw = process.env.OLLAMA_URL || process.env.NEXT_PUBLIC_OLLAMA_URL;
  if (!raw) return null;
  return raw.replace(/\/$/, '');
}

export function isUsingOllama(): boolean {
  return ollamaBaseUrl() !== null;
}

const ollamaFetch: FetchFunction = async (input, init) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

export function getSummaryLanguageModel(): LanguageModel {
  const ollamaUrl = ollamaBaseUrl();
  if (ollamaUrl) {
    const openai = createOpenAI({
      baseURL: `${ollamaUrl}/v1`,
      apiKey: 'ollama',
      fetch: ollamaFetch,
    });
    const modelId =
      process.env.OLLAMA_MODEL ||
      process.env.NEXT_PUBLIC_OLLAMA_MODEL ||
      'qwen2.5-coder:1.5b';

    // openai() defaults to Responses API (/v1/responses) which many Ollama
    // gateways do not support or time out on — use Chat Completions instead.
    return wrapLanguageModel({
      model: openai.chat(modelId),
      middleware: extractJsonMiddleware(),
    });
  }

  const apiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Ingen AI-leverandør konfigurert (OLLAMA_URL eller GEMINI_API_KEY)'
    );
  }

  return google(process.env.GEMINI_MODEL || 'gemini-2.0-flash');
}

/** Batch (alle kort) – brukes primært med Gemini. */
export function getGenerateCallSettings() {
  return {
    maxRetries: isUsingOllama() ? 1 : 2,
    maxOutputTokens: isUsingOllama() ? 700 : 1200,
  } as const;
}

/** Ett kort om gangen – mindre payload, færre gateway timeouts. */
export function getSingleCardCallSettings() {
  return {
    maxRetries: isUsingOllama() ? 2 : 2,
    maxOutputTokens: isUsingOllama() ? 380 : 550,
  } as const;
}
