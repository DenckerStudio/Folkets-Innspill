import Link from 'next/link';
import { MessageSquare, ThumbsUp, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import FadeIn from '@/components/fade-in';
import { getAnonSupabase } from '@/lib/supabase';
import NewThreadButton from './new-thread-form';

export const dynamic = 'force-dynamic';

async function getForumThreads() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const supabase = getAnonSupabase();
    const { data: threads, error } = await supabase
      .from('forum_threads')
      .select(`
        id,
        title,
        body,
        stortinget_issue_id,
        is_resolved,
        created_at,
        author_user_id,
        users:author_user_id (name)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching forum threads:', error);
      return [];
    }

    const threadIds = (threads || []).map(t => t.id);
    
    let replyCounts: Record<string, number> = {};
    let likeCounts: Record<string, number> = {};

    if (threadIds.length > 0) {
      const { data: replies } = await supabase
        .from('forum_replies')
        .select('thread_id')
        .in('thread_id', threadIds);
      
      if (replies) {
        for (const r of replies) {
          replyCounts[r.thread_id] = (replyCounts[r.thread_id] || 0) + 1;
        }
      }

      const { data: likes } = await supabase
        .from('forum_likes')
        .select('target_id')
        .eq('target_type', 'thread')
        .in('target_id', threadIds);
      
      if (likes) {
        for (const l of likes) {
          likeCounts[l.target_id] = (likeCounts[l.target_id] || 0) + 1;
        }
      }
    }

    return (threads || []).map(thread => ({
      id: thread.id,
      title: thread.title,
      preview: (thread.body || '').slice(0, 120) + ((thread.body || '').length > 120 ? '...' : ''),
      author: (thread.users as any)?.name || 'Anonym',
      createdAt: formatTimeAgo(thread.created_at),
      replies: replyCounts[thread.id] || 0,
      likes: likeCounts[thread.id] || 0,
      relatedIssueId: thread.stortinget_issue_id,
      isResolved: thread.is_resolved,
    }));
  } catch (e) {
    console.error('Failed to fetch forum threads:', e);
    return [];
  }
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Akkurat nå';
  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffHours < 24) return `${diffHours} timer siden`;
  if (diffDays === 1) return '1 dag siden';
  return `${diffDays} dager siden`;
}

export default async function ForumPage() {
  const topics = await getForumThreads();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <FadeIn delay={0.1}>
        <div className="bg-white p-8 md:p-12 border-b border-gray-200 shadow-sm text-center rounded-2xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Community Forum</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Et åpent rom for å diskutere pågående saker, stille spørsmål til politikere, og debattere konsekvensene av stortingsvedtak.
          </p>
        </div>
      </FadeIn>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Diskusjoner</h2>
            <NewThreadButton />
          </div>

          {topics.length === 0 ? (
            <FadeIn delay={0.2} direction="up">
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <MessageSquare className="w-14 h-14 mx-auto mb-4 text-gray-200" />
                <p className="text-xl font-semibold text-gray-900 mb-2">Ingen diskusjoner ennå</p>
                <p className="text-gray-500 mb-6">Vær den første til å starte en diskusjon om en stortingssak!</p>
              </div>
            </FadeIn>
          ) : (
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <FadeIn key={topic.id} delay={0.05 * Math.min(index, 8)} direction="up">
                  <Link href={`/forum/${topic.id}`} className="block bg-white p-5 border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all rounded-xl group">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0 mt-0.5">
                        {topic.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors flex items-center flex-wrap gap-2">
                            {topic.title}
                            {topic.isResolved && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Besvart
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              {topic.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {topic.replies}
                            </span>
                          </div>
                        </div>
                        {topic.preview && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{topic.preview}</p>
                        )}
                        <div className="flex items-center text-xs text-gray-400 mt-2 gap-3">
                          <span className="font-medium text-gray-600">{topic.author}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {topic.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-72 space-y-6">
          <FadeIn delay={0.3} direction="left">
            <div className="bg-indigo-50 border border-indigo-100 p-5 shadow-sm rounded-xl">
              <h3 className="text-base font-bold text-indigo-900 mb-3">Slik fungerer forumet</h3>
              <ul className="space-y-2.5 text-sm text-indigo-800">
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 font-bold text-indigo-400">1</span>
                  Logg inn for å skrive innlegg og svare.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 font-bold text-indigo-400">2</span>
                  Politikere med blå hake kan gi offisielle svar.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 font-bold text-indigo-400">3</span>
                  Hold en saklig og respektfull tone.
                </li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.4} direction="left">
            <div className="bg-white border border-gray-200 p-5 shadow-sm rounded-xl">
              <h3 className="text-base font-bold text-gray-900 mb-3">Statistikk</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Diskusjoner</span>
                  <span className="font-semibold text-gray-900">{topics.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Totalt svar</span>
                  <span className="font-semibold text-gray-900">{topics.reduce((s, t) => s + t.replies, 0)}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
