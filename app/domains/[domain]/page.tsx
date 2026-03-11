import { getDomain } from '@/lib/domains';
import { fetchDomainIssues, JiraIssue } from '@/lib/jira';
import TopBar from '@/components/TopBar';
import DomainView from '@/components/DomainView';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ domain: string }>;
}

export default async function DomainPage({ params }: Props) {
  const { domain } = await params;
  const config = getDomain(domain);
  if (!config) notFound();

  let issues: JiraIssue[] = [];
  const lastSynced = new Date().toISOString();

  try {
    issues = await fetchDomainIssues(config.projects, config.labelFilter);
  } catch (e) {
    console.error('DomainPage fetch error:', e);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar lastSynced={lastSynced} />
      <DomainView domain={domain} config={config} initialIssues={issues} lastSynced={lastSynced} />
    </div>
  );
}
