import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users, Clock, MousePointer2, MessageSquare } from 'lucide-react';
import { getAnonSupabase } from '@/lib/supabase';
import HearingCommentForm from './comment-form';

export const dynamic = 'force-dynamic';

async function getHearing(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const supabase = getAnonSupabase();
    const { data: hearing, error } = await supabase
      .from('hearings')
      .select(`
        id,
        title,
        description,
        deadline,
        stortinget_issue_id,
        created_at
      `)
      .eq('id', id)
      .single();

    if (error || !hearing) return null;

    const { data: comments } = await supabase
      .from('hearing_comments')
      .select(`
        id,
        body,
        created_at,
        author_user_id,
        users:author_user_id (name)
      `)
      .eq('hearing_id', hearing.id)
      .order('created_at', { ascending: true });

    const isOpen = hearing.deadline ? new Date(hearing.deadline) > new Date() : true;

    return {
      id: hearing.id,
      title: hearing.title,
      description: hearing.description,
      deadline: hearing.deadline
        ? new Date(hearing.deadline).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
        : null,
      isOpen,
      stortingetIssueId: hearing.stortinget_issue_id,
      comments: (comments || []).map(c => ({
        id: c.id,
        author: (c.users as any)?.name || 'Anonym',
        body: c.body,
        createdAt: new Date(c.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }),
      })),
    };
  } catch (e) {
    console.error('Failed to fetch hearing:', e);
    return null;
  }
}

export default async function HoringDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hearing = await getHearing(id);

  if (!hearing) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <Link href="/horinger" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Tilbake til høringer
      </Link>
      
      <div className="bg-white p-8 md:p-12 border border-gray-200 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${hearing.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
            {hearing.isOpen ? 'Åpen for innspill' : 'Lukket'}
          </span>
          {hearing.deadline && (
            <span className="text-gray-500 font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Frist: {hearing.deadline}
            </span>
          )}
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{hearing.title}</h1>
        
        <div className="flex items-center space-x-8 pb-8 border-b border-gray-200 mb-8 text-gray-600 font-medium">
          <span className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
            {hearing.comments.length} innspill
          </span>
        </div>

        {hearing.description && (
          <div className="prose prose-lg max-w-none prose-indigo mb-8">
            <p>{hearing.description}</p>
          </div>
        )}

        {hearing.stortingetIssueId && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
            <Link href={`/sak/${hearing.stortingetIssueId}`} className="text-indigo-600 hover:text-indigo-500 font-medium text-sm">
              Se relatert stortingssak →
            </Link>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Innspill ({hearing.comments.length})</h2>
        
        {hearing.comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Ingen innspill ennå. Vær den første til å gi innspill!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hearing.comments.map(comment => (
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
        )}

        <HearingCommentForm hearingId={hearing.id} isOpen={hearing.isOpen} />
      </div>
    </div>
  );
}
