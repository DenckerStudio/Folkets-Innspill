'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, X } from 'lucide-react';
import { routes } from '@/lib/routes';

type DraftPrompt = {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  topic_tags: string[];
  sensitivity: string;
  source_headlines: { title?: string; outlet?: string; url?: string; imageUrl?: string | null; videoUrl?: string | null }[];
  created_at: string;
};

export default function AdminForumPromptsClient() {
  const [prompts, setPrompts] = useState<DraftPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/forum-prompts');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ingen tilgang');
        setPrompts([]);
        return;
      }
      setPrompts(data.prompts || []);
    } catch {
      setError('Kunne ikke laste');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: 'active' | 'archived') => {
    setActing(id);
    try {
      const res = await fetch('/api/admin/forum-prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Feil ved oppdatering');
        return;
      }
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-12 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
        Laster…
      </div>
    );
  }

  return (
    <div>
      <Link href={routes.forum} className="text-sm text-indigo-600 hover:text-indigo-500 mb-6 inline-block">
        ← Tilbake til forum
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Godkjenn forum-spørsmål
        {prompts.length > 0 && (
          <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold text-amber-900">
            {prompts.length} utkast
          </span>
        )}
      </h1>
      <p className="text-sm text-gray-600 mb-8">
        Sensitive spørsmål fra n8n lander her som utkast. Sett FORUM_ADMIN_EMAILS i miljøvariabler for tilgang.
      </p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      {prompts.length === 0 && !error ? (
        <p className="text-gray-500 py-8">Ingen utkast venter på godkjenning.</p>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <article key={prompt.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {prompt.sensitivity}
                </span>
                {(prompt.topic_tags || []).map((tag) => (
                  <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{prompt.question}</h2>
              <ul className="flex flex-wrap gap-2 mb-4">
                {(prompt.options || []).map((opt) => (
                  <li key={opt.id} className="text-sm bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg">
                    {opt.label}
                  </li>
                ))}
              </ul>
              {Array.isArray(prompt.source_headlines) && prompt.source_headlines.length > 0 && (
                <ul className="text-xs text-gray-500 mb-4 space-y-1">
                  {prompt.source_headlines.slice(0, 3).map((h, i) => (
                    <li key={i}>
                      {h.url ? (
                        <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          {h.title} ({h.outlet})
                        </a>
                      ) : (
                        <span>
                          {h.title} ({h.outlet})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={acting === prompt.id}
                  onClick={() => updateStatus(prompt.id, 'active')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Publiser
                </button>
                <button
                  type="button"
                  disabled={acting === prompt.id}
                  onClick={() => updateStatus(prompt.id, 'archived')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Avvis
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
