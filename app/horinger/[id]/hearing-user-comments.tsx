'use client';

import { useEffect, useState } from 'react';

type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export default function HearingUserComments({ stortingetHoringId }: { stortingetHoringId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`/api/hearings?stortingetHoringId=${encodeURIComponent(stortingetHoringId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.comments)) {
          setComments(
            data.comments.map((c: Comment) => ({
              ...c,
              createdAt: new Date(c.createdAt).toLocaleDateString('nb-NO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            }))
          );
        }
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener('hearing-comment-posted', onRefresh);
    return () => window.removeEventListener('hearing-comment-posted', onRefresh);
  }, [stortingetHoringId]);

  if (loading) {
    return <div className="h-16 bg-gray-50 rounded-xl animate-pulse" />;
  }

  if (comments.length === 0) {
    return (
      <p className="text-center py-6 text-gray-500 text-sm">Ingen innspill ennå. Vær den første til å dele din mening.</p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
              {comment.author.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-gray-900">{comment.author}</div>
              <div className="text-xs text-gray-500">{comment.createdAt}</div>
            </div>
          </div>
          <p className="text-gray-700">{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
