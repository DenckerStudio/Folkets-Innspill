import Link from 'next/link';
import { MessageSquare, ThumbsUp, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import FadeIn from '@/components/fade-in';
import { getAnonSupabase } from '@/lib/supabase';

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
    <div className="max-w-5xl mx-auto space-y-12">
      <FadeIn delay={0.1}>
        <div className="bg-white p-8 md:p-12 border-b border-gray-200 shadow-sm text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Community Forum</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Et åpent rom for å diskutere pågående saker, stille spørsmål til politikere, og debattere konsekvensene av stortingsvedtak.
          </p>
        </div>
      </FadeIn>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nylige diskusjoner</h2>
            <Link href="/auth/login" className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm flex items-center hover:bg-indigo-700 transition-colors shadow-sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Start ny diskusjon
            </Link>
          </div>

          {topics.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Ingen diskusjoner ennå</p>
              <p className="text-sm mt-2">Vær den første til å starte en diskusjon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <FadeIn key={topic.id} delay={0.1 * index} direction="up">
                  <Link href={`/dashboard/forum/${topic.id}`} className="block bg-white p-6 border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors flex items-center">
                          {topic.title}
                          {topic.isResolved && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Besvart av politiker
                            </span>
                          )}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="font-medium text-gray-700">Av {topic.author}</span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {topic.createdAt}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2 text-sm text-gray-500 pr-2">
                         <span className="flex items-center font-medium">
                          <ThumbsUp className="w-4 h-4 mr-1.5 text-gray-400" />
                          {topic.likes}
                        </span>
                        <span className="flex items-center font-medium">
                          <MessageCircle className="w-4 h-4 mr-1.5 text-gray-400" />
                          {topic.replies}
                        </span>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-80 space-y-8">
           <FadeIn delay={0.3} direction="left">
             <div className="bg-indigo-50 border border-indigo-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-indigo-900 mb-3">Slik fungerer forumet</h3>
                <ul className="space-y-3 text-sm text-indigo-800">
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5 font-bold">•</span>
                    Du må være logget inn for å skrive innlegg.
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5 font-bold">•</span>
                    Henvend deg direkte til offisielle representanter - de dukker opp med blå hake.
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5 font-bold">•</span>
                    Hold en saklig og respektfull tone.
                  </li>
                </ul>
             </div>
           </FadeIn>
        </div>
      </div>
    </div>
  );
}
