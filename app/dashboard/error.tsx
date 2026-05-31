'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard]', error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Noe gikk galt</h1>
      <p className="text-gray-600 mb-6">
        Vi kunne ikke laste denne siden. Prøv igjen, eller gå tilbake til utforsk.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          Prøv igjen
        </button>
        <Link
          href={routes.utforsk}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
        >
          Gå til utforsk
        </Link>
      </div>
    </div>
  );
}
