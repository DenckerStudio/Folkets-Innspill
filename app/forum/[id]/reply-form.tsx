'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function ForumReplyForm({ threadId }: { threadId: string }) {
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!body.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_reply',
          thread_id: threadId,
          body: body.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Kunne ikke publisere svar');
        return;
      }

      setBody('');
      router.refresh();
    } catch (e) {
      setError('En feil oppstod');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Skriv et svar</h3>
      {!user ? (
        <div className="text-center py-4">
          <Link href="/auth/login" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium">
            <LogIn className="w-4 h-4 mr-1.5" />
            Logg inn for å svare
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 py-2 px-3 rounded-lg">
              {error}
            </div>
          )}
          <textarea 
            rows={4} 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Hva tenker du om dette?"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!body.trim() || isSubmitting}
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Publiserer...' : 'Publiser svar'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
