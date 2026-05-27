'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, MessageSquare, X, Send } from 'lucide-react';

export default function NewThreadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="px-4 py-2.5 bg-indigo-600 text-white font-medium text-sm flex items-center hover:bg-indigo-700 transition-colors shadow-sm rounded-xl"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Logg inn for å diskutere
      </Link>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Kunne ikke opprette diskusjon');
        setIsSubmitting(false);
        return;
      }

      setTitle('');
      setBody('');
      setIsOpen(false);

      if (data.threadId) {
        router.push(`/forum/${data.threadId}`);
      }
      router.refresh();
    } catch {
      setError('En feil oppstod');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-indigo-600 text-white font-medium text-sm flex items-center hover:bg-indigo-700 transition-colors shadow-sm rounded-xl"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Start ny diskusjon
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Ny diskusjon</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 py-2 px-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="thread-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Tittel
                </label>
                <input
                  id="thread-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Hva vil du diskutere?"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="thread-body" className="block text-sm font-medium text-gray-700 mb-1">
                  Innhold
                </label>
                <textarea
                  id="thread-body"
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Beskriv hva du tenker, still et spørsmål, eller start en debatt..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !body.trim() || isSubmitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center shadow-sm"
                >
                  {isSubmitting ? (
                    'Publiserer...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1.5" />
                      Publiser
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
