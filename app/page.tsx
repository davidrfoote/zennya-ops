import { fetchAllIssues } from '@/lib/jira';
import TopBar from '@/components/TopBar';
import PipelineBoard from '@/components/PipelineBoard';

export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  let issues: Awaited<ReturnType<typeof fetchAllIssues>> = [];
  const lastSynced = new Date().toISOString();

  try {
    issues = await fetchAllIssues();
  } catch (e) {
    console.error('Failed to fetch issues on render:', e);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar lastSynced={lastSynced} />
      <PipelineBoard initialIssues={issues} lastSynced={lastSynced} />
    </div>
  );
}
