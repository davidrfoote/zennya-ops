import TopBar from '@/components/TopBar';
import RoadmapView from '@/components/RoadmapView';
import { fetchEpics, JiraIssue } from '@/lib/jira';

export const dynamic = 'force-dynamic';

export default async function RoadmapPage() {
  const lastSynced = new Date().toISOString();
  let epics: JiraIssue[] = [];
  try {
    epics = await fetchEpics();
  } catch (e) {
    console.error('RoadmapPage fetch error:', e);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar lastSynced={lastSynced} />
      <RoadmapView initialEpics={epics} lastSynced={lastSynced} />
    </div>
  );
}
