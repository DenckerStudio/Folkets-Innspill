'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  AtSign,
  FileText,
  Gavel,
  Lightbulb,
  Link2,
  Loader2,
  LogIn,
  Shield,
  Sparkles,
  Vote,
} from 'lucide-react';
import { FORUM_LIMITS } from '@/lib/forum/validation';
import {
  contextItemKey,
  insertContextIntoBody,
  removeContextFromBody,
  sakContextItem,
  type ForumContextItem,
} from '@/lib/forum/context';
import { routes } from '@/lib/routes';
import ContextPicker, { ContextChip } from '@/components/forum/context-picker';

type CreateThreadFormProps = {
  sakId?: string | null;
  sakTitle?: string | null;
  suggestedIssues?: { id: string; title: string }[];
};

export default function CreateThreadForm({
  sakId: initialSakId,
  sakTitle: initialSakTitle,
  suggestedIssues = [],
}: CreateThreadFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [primarySakId, setPrimarySakId] = useState<string | null>(initialSakId || null);
  const [primarySakTitle, setPrimarySakTitle] = useState<string | null>(initialSakTitle || null);
  const [linkedItems, setLinkedItems] = useState<ForumContextItem[]>([]);
  const [relatedItems, setRelatedItems] = useState<ForumContextItem[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  const backHref = primarySakId ? `${routes.forum}?sak=${primarySakId}` : routes.forum;

  const linkedKeys = useMemo(
    () => new Set(linkedItems.map(contextItemKey)),
    [linkedItems]
  );

  useEffect(() => {
    if (!primarySakId) {
      setRelatedItems([]);
      return;
    }

    let cancelled = false;
    setLoadingRelated(true);

    fetch(`/api/forum/sak-resources/${primarySakId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setRelatedItems(data.related || []);
        if (data.sak?.title) {
          setPrimarySakTitle(data.sak.title);
        }
      })
      .catch(() => {
        if (!cancelled) setRelatedItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRelated(false);
      });

    return () => {
      cancelled = true;
    };
  }, [primarySakId]);

  const appendContext = useCallback((item: ForumContextItem, asPrimarySak = false) => {
    if (asPrimarySak && item.kind === 'sak') {
      setPrimarySakId(item.id);
      setPrimarySakTitle(item.title);
    }

    setLinkedItems((prev) => {
      const key = contextItemKey(item);
      if (prev.some((p) => contextItemKey(p) === key)) return prev;
      return [...prev, item];
    });

    setBody((prev) => insertContextIntoBody(prev, item));
    bodyRef.current?.focus();
  }, []);

  const handleSelect = useCallback(
    (item: ForumContextItem) => {
      if (item.kind === 'sak' && !primarySakId) {
        appendContext(item, true);
        return;
      }
      appendContext(item, false);
    },
    [appendContext, primarySakId]
  );

  const insertAtCursor = (snippet: string) => {
    const el = bodyRef.current;
    if (!el) {
      setBody((prev) => `${prev}${prev ? '\n' : ''}${snippet}`);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = `${body.slice(0, start)}${snippet}${body.slice(end)}`;
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const removeLinkedItem = useCallback((item: ForumContextItem) => {
    setLinkedItems((prev) => prev.filter((p) => contextItemKey(p) !== contextItemKey(item)));
    setBody((prev) => removeContextFromBody(prev, item));
    if (item.kind === 'sak' && item.id === primarySakId) {
      setPrimarySakId(null);
      setPrimarySakTitle(null);
    }
  }, [primarySakId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || !body.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_thread',
          title: title.trim(),
          body: body.trim(),
          stortinget_issue_id: primarySakId,
          context_items: linkedItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Kunne ikke opprette tråd');
        return;
      }

      router.push(routes.forumTopic(data.threadId));
      router.refresh();
    } catch {
      setError('En feil oppstod');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickSuggestions = suggestedIssues.filter((s) => s.id !== primarySakId).slice(0, 4);

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 md:p-8">
        <Link
          href={backHref}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Tilbake til forumet
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Start ny diskusjon</h1>
          <p className="text-gray-600">
            Koble innlegget til saker, høringer og politikere for bedre kontekst og synlighet i appen.
          </p>
        </div>

        {!user ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
            <Link
              href={routes.login}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              Logg inn for å starte en diskusjon
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                role="alert"
                className="mb-4 text-sm text-red-600 bg-red-50 py-2 px-3 rounded-lg"
              >
                {error}
              </div>
            )}

            {primarySakId && primarySakTitle && (
              <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-1">Hovedsak</p>
                <p className="font-medium text-indigo-950">{primarySakTitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={routes.sak(primarySakId)} className="text-xs font-medium text-indigo-700 hover:text-indigo-600 inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Se sak
                  </Link>
                  <Link href={routes.sak(primarySakId)} className="text-xs font-medium text-indigo-700 hover:text-indigo-600 inline-flex items-center gap-1">
                    <Vote className="w-3.5 h-3.5" /> Stem
                  </Link>
                  <Link href={`${routes.sak(primarySakId)}#ai-summary`} className="text-xs font-medium text-indigo-700 hover:text-indigo-600 inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI-sammendrag
                  </Link>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="thread-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Tittel
                </label>
                <input
                  id="thread-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={FORUM_LIMITS.titleMax}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Hva vil du diskutere?"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {title.length}/{FORUM_LIMITS.titleMax} tegn (min. {FORUM_LIMITS.titleMin})
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="thread-body" className="block text-sm font-medium text-gray-700">
                    Innhold
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertAtCursor('\n@')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                      title="Nevn registrert bruker"
                      aria-label="Nevn bruker"
                    >
                      <AtSign className="w-3.5 h-3.5" /> Nevn
                    </button>
                  </div>
                </div>

                <textarea
                  ref={bodyRef}
                  id="thread-body"
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={FORUM_LIMITS.bodyMax}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono leading-relaxed"
                  placeholder="Skriv innlegget ditt. Bruk panelet til høyre for å koble saker, høringer og politikere."
                />
                <p className="mt-1 text-xs text-gray-500">
                  {body.length}/{FORUM_LIMITS.bodyMax} tegn · Referanser legges inn automatisk når du velger fra søk
                </p>
              </div>

              {linkedItems.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Koblede referanser</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedItems.map((item) => (
                      <ContextChip
                        key={contextItemKey(item)}
                        item={item}
                        isPrimary={item.kind === 'sak' && item.id === primarySakId}
                        onPrimary={
                          item.kind === 'sak'
                            ? () => {
                                setPrimarySakId(item.id);
                                setPrimarySakTitle(item.title);
                              }
                            : undefined
                        }
                        onRemove={() => removeLinkedItem(item)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <p className="text-xs text-gray-500 hidden sm:block">
                Tips: Nevn registrerte brukere med @. Koble saker og politikere via søkepanelet til høyre.
              </p>
              <button
                type="submit"
                disabled={
                  title.trim().length < FORUM_LIMITS.titleMin || !body.trim() || isSubmitting
                }
                className="ml-auto px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Oppretter…' : 'Publiser diskusjon'}
              </button>
            </div>
          </form>
        )}
      </div>

      <aside className="space-y-4">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-600" />
            Koble til i appen
          </h2>
          <ContextPicker
            onSelect={handleSelect}
            selectedKeys={linkedKeys}
            placeholder="Søk sak, høring, politiker…"
          />
        </div>

        {quickSuggestions.length > 0 && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Mest engasjerte saker</h3>
            <div className="space-y-2">
              {quickSuggestions.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => handleSelect(sakContextItem(issue.id, issue.title))}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 text-sm"
                >
                  <span className="font-medium text-gray-900 line-clamp-2">{issue.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {primarySakId && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Relatert til hovedsaken</h3>
            {loadingRelated ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Henter forslag…
              </div>
            ) : relatedItems.length === 0 ? (
              <p className="text-sm text-gray-500">Ingen ekstra forslag funnet for denne saken.</p>
            ) : (
              <div className="space-y-2">
                {relatedItems.map((item) => (
                  <button
                    key={contextItemKey(item)}
                    type="button"
                    onClick={() => handleSelect(item)}
                    disabled={linkedKeys.has(contextItemKey(item))}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 disabled:opacity-50 text-sm border border-gray-100"
                  >
                    <span className="font-medium text-gray-900 line-clamp-2">{item.title}</span>
                    {item.subtitle && (
                      <span className="block text-xs text-gray-500 mt-0.5">{item.subtitle}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
          <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Slik fungerer koblinger
          </h3>
          <ul className="space-y-2 text-xs text-indigo-900/90">
            <li className="flex gap-2">
              <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Første sak du velger blir <strong>hovedsak</strong> og vises på tråden.</span>
            </li>
            <li className="flex gap-2">
              <Gavel className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Høringer og relaterte saker legges som referanser i teksten.</span>
            </li>
            <li className="flex gap-2">
              <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Politikere kobles via søkepanelet, ikke @-nevning.</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
