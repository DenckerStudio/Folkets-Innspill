import Link from 'next/link';
import { ArrowLeft, User, Clock, MessageCircle, ThumbsUp, CheckCircle, ShieldCheck } from 'lucide-react';
import FadeIn from '@/components/fade-in';
import { getSaker } from '@/lib/stortinget';

export const dynamic = 'force-dynamic';

export default async function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const issues = await getSaker();
  
  // Mock data for a single post based on the requested ID
  const isResolved = resolvedParams.id === '1' || resolvedParams.id === '4';
  
  const post = {
    id: resolvedParams.id,
    title: resolvedParams.id === '1' ? 'Hvorfor stemte Arbeiderpartiet mot i saken om strømstøtte?' : 'Eksempel på et lengre innlegg fra en velger om en konkret sak.',
    content: 'Jeg leste gjennom saksdokumentene og sliter med å forstå argumentasjonen her. Det virker som om dette primært treffer de som allerede sliter mest. Kan noen fra Stortinget, gjerne de som representerer flertallet her, forklare hvordan dette regnestykket går opp?',
    author: 'Ola Nordmann',
    createdAt: 'I dag kl. 14:30',
    likes: 124,
    relatedIssue: issues[0],
    replies: [
      {
        id: 'r1',
        author: 'Kari Trasti',
        content: 'Helt enig, dette henger ikke på greip!',
        createdAt: 'I dag kl. 15:10',
        likes: 12,
        isVerifiedPolitician: false
      },
      {
        id: 'r2',
        author: 'Jonas Gahr Støre',
        party: 'Arbeiderpartiet',
        content: 'Takk for spørsmålet, Ola. Grunnen til at vi stemte som vi gjorde er at denne spesifikke modellen for strømstøtte ikke treffer målrettet nok. Vi jobber med et alternativt forslag som vil sikre at midlene i større grad går til de som trenger det mest, fremfor at de rike får ytterligere kutt i sine regninger.',
        createdAt: 'I dag kl. 16:45',
        likes: 345,
        isVerifiedPolitician: true,
        isOfficialResponse: true
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <FadeIn delay={0.1}>
        <Link href="/forum" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Tilbake til forumet
        </Link>
      </FadeIn>

      {/* Main Post */}
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
                 <button className="flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                   <ThumbsUp className="w-4 h-4 mr-1.5" />
                   {post.likes}
                 </button>
               </div>
            </div>

            <div className="prose prose-indigo max-w-none mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">{post.content}</p>
            </div>

            {post.relatedIssue && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Relatert stortingssak</h3>
                <Link href={`/sak/${post.relatedIssue.id}`} className="block hover:bg-white p-3 rounded-md transition-colors border border-transparent hover:border-gray-200 shadow-sm">
                   <div className="text-indigo-600 font-semibold mb-1">{post.relatedIssue.title}</div>
                   <div className="text-sm text-gray-500 line-clamp-2">{post.relatedIssue.summary}</div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Replies Section */}
      <FadeIn delay={0.3} direction="up">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-gray-400" />
              Svar ({post.replies.length})
            </h2>
          </div>

          <div className="space-y-4">
            {post.replies.map((reply, index) => (
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
                             {reply.party}
                           </span>
                         )}
                       </div>
                       <div className="text-xs text-gray-500">{reply.createdAt}</div>
                     </div>
                   </div>
                </div>
                
                <p className="text-gray-700 mt-2">{reply.content}</p>
                
                <div className="mt-4 flex items-center">
                  <button className="flex items-center text-xs font-medium text-gray-500 hover:text-indigo-600">
                    <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                    {reply.likes} Liker
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Box */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skriv et svar</h3>
            <textarea 
              rows={4} 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Hva tenker du om dette?"
            ></textarea>
            <div className="mt-4 flex justify-end">
              <button className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm">
                Publiser svar
              </button>
            </div>
          </div>

        </div>
      </FadeIn>
    </div>
  );
}
