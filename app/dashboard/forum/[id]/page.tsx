import Link from 'next/link';
import { ArrowLeft, Clock, MessageCircle, ThumbsUp, CheckCircle, ShieldCheck } from 'lucide-react';
import FadeIn from '@/components/fade-in';
import { notFound } from 'next/navigation';
import { getAnonSupabase } from '@/lib/supabase';
import ForumReplyForm from './reply-form';

export const dynamic = 'force-dynamic';

async function getThread(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const supabase = getAnonSupabase();
    const { data: thread, error } = await supabase
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
      .eq('id', id)
      .single();

    if (error || !thread) return null;

    const { data: likes } = await supabase
      .from('forum_likes')
      .select('user_id')
      .eq('target_type', 'thread')
      .eq('target_id', thread.id);

    const { data: replies } = await supabase
      .from('forum_replies')
      .select(`
        id,
        body,
        is_official_response,
        created_at,
        author_user_id,
        users:author_user_id (name)
      `)
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });

    let replyLikeCounts: Record<string, number> = {};
    if (replies && replies.length > 0) {
      const replyIds = replies.map(r => r.id);
      const { data: replyLikes } = await supabase
        .from('forum_likes')
        .select('target_id')
        .eq('target_type', 'reply')
        .in('target_id', replyIds);
      if (replyLikes) {
        for (const l of replyLikes) {
          replyLikeCounts[l.target_id] = (replyLikeCounts[l.target_id] || 0) + 1;
        }
      }
    }

    let politicianUserIds: Set<string> = new Set();
    let politicianParties: Record<string, string> = {};
    if (replies && replies.length > 0) {
      const authorIds = [...new Set(replies.map(r => r.author_user_id))];
      const { data: profiles } = await supabase
        .from('politician_profiles')
        .select('user_id, stortinget_rep_id')
        .in('user_id', authorIds);
      if (profiles) {
        for (const p of profiles) {
          politicianUserIds.add(p.user_id);
        }
      }
    }

    let relatedIssueTitle: string | null = null;
    if (thread.stortinget_issue_id) {
      const { data: issue } = await supabase
        .from('stortinget_issues')
        .select('title')
        .eq('id', thread.stortinget_issue_id)
        .single();
      if (issue) {
        relatedIssueTitle = issue.title;
      }
    }

    return {
      id: thread.id,
      title: thread.title,
      content: thread.body,
      author: (thread.users as any)?.name || 'Anonym',
      createdAt: formatDate(thread.created_at),
      likes: likes?.length || 0,
      relatedIssueId: thread.stortinget_issue_id,
      relatedIssueTitle,
      replies: (replies || []).map(reply => ({
        id: reply.id,
        author: (reply.users as any)?.name || 'Anonym',
        content: reply.body,
        createdAt: formatDate(reply.created_at),
        likes: replyLikeCounts[reply.id] || 0,
        isVerifiedPolitician: politicianUserIds.has(reply.author_user_id),
        isOfficialResponse: reply.is_official_response,
      })),
    };
  } catch (e) {
    console.error('Failed to fetch thread:', e);
    return null;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Akkurat nå';
  if (diffHours < 24) return `I dag kl. ${date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffHours < 48) return `I går kl. ${date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await getThread(resolvedParams.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <FadeIn delay={0.1}>
        <Link href="/dashboard/forum" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Tilbake til forumet
        </Link>
      </FadeIn>

      <FadeIn delay={0.2} direction="up">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
               <div className="flex items-center space-x-4">
                 <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                   {post.author.charAt(0)}
                 </div>
                 <div>
                   <div className="font-medium text-gray-900">{post.author}</div>
                   <div className="text-sm text-gray-500 flex items-center">
                     <Clock className="w-3.5 h-3.5 mr-1" />
                     {post.createdAt}
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center space-x-2">
                 <span className="flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600">
                   <ThumbsUp className="w-4 h-4 mr-1.5" />
                   {post.likes}
                 </span>
               </div>
            </div>

            <div className="prose prose-indigo max-w-none mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">{post.content}</p>
            </div>

            {post.relatedIssueId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Relatert stortingssak</h3>
                <Link href={`/dashboard/sak/${post.relatedIssueId}`} className="block hover:bg-white p-3 rounded-md transition-colors border border-transparent hover:border-gray-200 shadow-sm">
                   <div className="text-indigo-600 font-semibold mb-1">{post.relatedIssueTitle || `Sak ${post.relatedIssueId}`}</div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.3} direction="up">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-gray-400" />
              Svar ({post.replies.length})
            </h2>
          </div>

          {post.replies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Ingen svar ennå. Vær den første til å svare!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {post.replies.map((reply) => (
                <div 
                  key={reply.id} 
                  className={`bg-white border rounded-xl p-6 ${reply.isOfficialResponse ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100' : 'border-gray-200 shadow-sm'}`}
                >
                  {reply.isOfficialResponse && (
                    <div className="bg-indigo-50 text-indigo-800 text-sm font-bold px-3 py-1.5 mb-4 inline-flex items-center rounded-md border border-indigo-100">
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Offisielt Svar fra Politiker
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3">
                     <div className="flex items-center space-x-3">
                       <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${reply.isVerifiedPolitician ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                         {reply.author.charAt(0)}
                       </div>
                       <div>
                         <div className="font-medium text-gray-900 flex items-center">
                           {reply.author}
                           {reply.isVerifiedPolitician && (
                             <span className="ml-1.5 text-indigo-600 flex items-center text-xs bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                               <ShieldCheck className="w-3 h-3 mr-1" />
                               Verifisert
                             </span>
                           )}
                         </div>
                         <div className="text-xs text-gray-500">{reply.createdAt}</div>
                       </div>
                     </div>
                  </div>
                  
                  <p className="text-gray-700 mt-2">{reply.content}</p>
                  
                  <div className="mt-4 flex items-center">
                    <span className="flex items-center text-xs font-medium text-gray-500">
                      <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                      {reply.likes} Liker
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <ForumReplyForm threadId={post.id} />
        </div>
      </FadeIn>
    </div>
  );
}
