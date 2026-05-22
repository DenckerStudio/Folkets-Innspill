import Link from 'next/link';
import { MessageSquare, ThumbsUp, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import FadeIn from '@/components/fade-in';
import { getSaker } from '@/lib/stortinget';

export const dynamic = 'force-dynamic';

export default async function ForumPage() {
  // We'll mock some forum topics and relate them to actual issues
  const issues = await getSaker();
  const topIssues = issues.slice(0, 3);
  
  const mockTopics = [
    {
      id: '1',
      title: 'Hvorfor stemte Arbeiderpartiet mot i saken om strømstøtte?',
      author: 'Ola Nordmann',
      createdAt: '2 timer siden',
      replies: 45,
      likes: 120,
      relatedIssue: topIssues[0],
      isResolved: true
    },
    {
      id: '2',
      title: 'Dette forslaget om endring i skatteloven treffer de med lavest inntekt hardest.',
      author: 'Kari Trasti',
      createdAt: '5 timer siden',
      replies: 12,
      likes: 89,
      relatedIssue: topIssues[1],
      isResolved: false
    },
    {
      id: '3',
      title: 'Når forventes det at den nye helsereformen trer i kraft?',
      author: 'Jens Haugland',
      createdAt: '1 dag siden',
      replies: 8,
      likes: 34,
      relatedIssue: topIssues[2],
      isResolved: false
    },
    {
      id: '4',
      title: 'Kan noen forklare konsekvensene av vedtaket om rusreformen?',
      author: 'Silje Solbakken',
      createdAt: '2 dager siden',
      replies: 156,
      likes: 450,
      relatedIssue: null,
      isResolved: true
    }
  ];

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
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nylige diskusjoner</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm flex items-center hover:bg-indigo-700 transition-colors shadow-sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Start ny diskusjon
            </button>
          </div>

          <div className="space-y-4">
            {mockTopics.map((topic, index) => (
              <FadeIn key={topic.id} delay={0.1 * index} direction="up">
                <Link href={`/forum/${topic.id}`} className="block bg-white p-6 border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group">
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
                      
                      {topic.relatedIssue && (
                        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-sm">
                          <span className="text-gray-500 font-medium">Relatert sak: </span>
                          <span className="text-indigo-600 hover:underline">{topic.relatedIssue.title}</span>
                        </div>
                      )}
                      
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
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-8">
           <FadeIn delay={0.3} direction="left">
             <div className="bg-indigo-50 border border-indigo-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-indigo-900 mb-3">Slik fungerer forumet</h3>
                <ul className="space-y-3 text-sm text-indigo-800">
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5 font-bold">•</span>
                    Du må være logget inn med BankID for å skrive innlegg.
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
           
           <FadeIn delay={0.4} direction="left">
             <div className="bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mest diskuterte kategorier</h3>
                <div className="space-y-4">
                  {['Helse og omsorg', 'Energi og miljø', 'Utdanning og forskning', 'Finans og økonomi'].map((category, index) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 hover:text-indigo-600 cursor-pointer">{category}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-xs text-gray-500 font-medium">
                        {((index * 13) % 90) + 10} innlegg
                      </span>
                    </div>
                  ))}
                </div>
             </div>
           </FadeIn>
        </div>
      </div>
    </div>
  );
}
