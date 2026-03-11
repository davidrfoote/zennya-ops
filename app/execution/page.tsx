import TopBar from '@/components/TopBar';
import ExecutionBoard from '@/components/ExecutionBoard';
import { fetchSprintIssues, JiraIssue } from '@/lib/jira';
import { fetchActiveSessions, DevSession } from '@/lib/opsdb';

export const dynamic = 'force-dynamic';

export default async function ExecutionPage() {
  const lastSynced = new Date().toISOString();
  let sprintIssues: JiraIssue[] = [];
  let sessions: DevSession[] = [];

  try {
    sprintIssues = await Promise.race([
      fetchSprintIssues(),
      new Promise<JiraIssue[]>((resolve) => setTimeout(() => resolve([]), 10000)),
    ]);
  } catch (e) {
    console.error('sprint fetch error:', e);
  }

  try {
    sessions = await Promise.race([
      fetchActiveSessions(),
      new Promise<DevSession[]>((resolve) => setTimeout(() => resolve([]), 5000)),
    ]);
  } catch (e) {
    console.error('sessions fetch error:', e);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar lastSynced={lastSynced} />
      <ExecutionBoard initialSprint={sprintIssues} initialSessions={sessions} lastSynced={lastSynced} />
    </div>
  );
}
