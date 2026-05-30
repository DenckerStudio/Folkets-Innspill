import FadeIn from '@/components/fade-in';
import CreateThreadForm from './create-thread-form';
import { getIssueTitle, getSuggestedIssues } from '@/lib/forum/queries';

export const dynamic = 'force-dynamic';

export default async function NewForumThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ sak?: string }>;
}) {
  const params = await searchParams;
  const sakId = params.sak?.trim() || null;
  const [sakTitle, suggestedIssues] = await Promise.all([
    sakId ? getIssueTitle(sakId) : Promise.resolve(null),
    getSuggestedIssues(),
  ]);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <FadeIn delay={0.1}>
        <CreateThreadForm
          sakId={sakId}
          sakTitle={sakTitle}
          suggestedIssues={suggestedIssues}
        />
      </FadeIn>
    </div>
  );
}
