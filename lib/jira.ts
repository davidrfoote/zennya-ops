import { getRedis } from './redis';

export type PipelineStage =
  | 'observation'
  | 'triage'
  | 'backlog'
  | 'to-scope'
  | 'ready'
  | 'in-sprint'
  | 'deployed';

export interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  stage: PipelineStage;
  project: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  labels: string[];
  iceScore?: number;
  url: string;
}

function normalizeStatus(status: string): PipelineStage {
  const s = status.toLowerCase().trim();
  if (s === 'open' || s === 'observation') return 'observation';
  if (s === 'in review' || s === 'triage') return 'triage';
  if (s === 'to do' || s === 'backlog') return 'backlog';
  if (s === 'to scope' || s === 'in scope') return 'to-scope';
  if (s === 'ready for handoff' || s === 'ready') return 'ready';
  if (s === 'in progress') return 'in-sprint';
  if (s === 'done' || s === 'deployed') return 'deployed';
  return 'backlog';
}

export async function fetchAllIssues(): Promise<JiraIssue[]> {
  let redis;
  try {
    redis = getRedis();
    const cached = await redis.get('jira:pipeline:all');
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.error('Redis get error:', e);
  }

  const baseUrl = process.env.JIRA_BASE_URL || 'https://zennya.atlassian.net';
  const email = process.env.JIRA_EMAIL || '';
  const token = process.env.JIRA_API_TOKEN || '';
  const auth = Buffer.from(`${email}:${token}`).toString('base64');

  const jql =
    'project in (ZI, MEDICAL, WELLNESS, STRATEGY, LOGISTICS, "BIZ-OPS", PSS, WORKFORCE, "PRODUCT-HEALTH", ADMIN) ORDER BY updated DESC';
  const issues: JiraIssue[] = [];
  let startAt = 0;
  const maxResults = 100;

  while (true) {
    const res = await fetch(`${baseUrl}/rest/api/3/search`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jql,
        startAt,
        maxResults,
        fields: ['summary', 'status', 'assignee', 'labels', 'project', 'customfield_10016'],
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Jira API error:', res.status, err);
      break;
    }

    const data = await res.json();
    const batch: unknown[] = data.issues || [];

    for (const issue of batch as Record<string, unknown>[]) {
      const f = issue.fields as Record<string, unknown>;
      const status = (f.status as Record<string, string>)?.name || '';
      const project = (f.project as Record<string, string>)?.key || (issue.key as string).split('-')[0];
      const assignee = f.assignee as Record<string, unknown> | null;
      issues.push({
        key: issue.key as string,
        summary: f.summary as string,
        status,
        stage: normalizeStatus(status),
        project,
        assigneeName: assignee?.displayName as string | undefined,
        assigneeAvatar: (assignee?.avatarUrls as Record<string, string>)?.[
          '24x24'
        ],
        labels: (f.labels as string[]) || [],
        iceScore: f.customfield_10016 as number | undefined,
        url: `${baseUrl}/browse/${issue.key}`,
      });
    }

    if (batch.length < maxResults) break;
    startAt += maxResults;
  }

  try {
    if (redis) {
      await redis.setex('jira:pipeline:all', 300, JSON.stringify(issues));
    }
  } catch (e) {
    console.error('Redis set error:', e);
  }

  return issues;
}
