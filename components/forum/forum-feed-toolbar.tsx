'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import type { ForumSort } from '@/lib/forum/queries';

const OPTIONS: { value: ForumSort; label: string }[] = [
  { value: 'nyeste', label: 'Nyeste' },
  { value: 'engasjert', label: 'Mest engasjert' },
];

export default function ForumFeedToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = (searchParams.get('sort') as ForumSort) || 'nyeste';
  const sak = searchParams.get('sak');

  const handleChange = (next: ForumSort) => {
    const params = new URLSearchParams();
    if (next !== 'nyeste') params.set('sort', next);
    if (sak) params.set('sak', sak);
    const qs = params.toString();
    router.push(qs ? `/dashboard/forum?${qs}` : '/dashboard/forum');
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <h2 className="text-lg font-bold text-gray-900">Diskusjoner</h2>
      <div className="relative">
        <label htmlFor="forum-sort" className="sr-only">
          Sorter
        </label>
        <select
          id="forum-sort"
          value={sort}
          onChange={(e) => handleChange(e.target.value as ForumSort)}
          className="appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-9 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}
