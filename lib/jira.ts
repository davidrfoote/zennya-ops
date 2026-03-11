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
  issueType: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  labels: string[];
  iceScore?: number;
  storyPoints?: number;
  startDate?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
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

async function tryGetRedisCache(cacheKey: string): Promise<JiraIssue[] | null> {
  try {
    const redis = getRedis();
    const cached = await Promise.race([
      redis.get(cacheKey),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);
    if (cached) return JSON.parse(cached as string);
  } catch (e) {
    console.error('Redis get error:', e);
  }
  return null;
}

async function trySetRedisCache(cacheKey: string, data: JiraIssue[]): Promise<void> {
  try {
    const redis = getRedis();
    await Promise.race([
      redis.setex(cacheKey, 300, JSON.stringify(data)),
      new Promise<void>((resolve) => setTimeout(resolve, 2000)),
    ]);
  } catch (e) {
    console.error('Redis set error:', e);
  }
}

async function fetchJiraIssues(jql: string, cacheKey: string, fields: string): Promise<JiraIssue[]> {
  const cached = await tryGetRedisCache(cacheKey);
  if (cached) return cached;

  const baseUrl = process.env.JIRA_BASE_URL || 'https://zennya.atlassian.net';
  const email = process.env.JIRA_EMAIL || '';
  const token = process.env.JIRA_API_TOKEN || '';
  const auth = Buffer.from(`${email}:${token}`).toString('base64');

  const issues: JiraIssue[] = [];
  let startAt = 0;
  const maxResults = 100;

  while (true) {
    const params = new URLSearchParams({
      jql,
      startAt: String(startAt),
      maxResults: String(maxResults),
      fields,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/rest/api/3/search/jql?${params}`, {
        method: 'GET',
        headers: { Authorization: `Basic ${auth}` },
        cache: 'no-store',
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeout);
      console.error('Jira fetch error:', e);
      break;
    }
    clearTimeout(timeout);

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
      const issueTypeObj = f.issuetype as Record<string, string> | null;
      issues.push({
        key: issue.key as string,
        summary: f.summary as string,
        status,
        stage: normalizeStatus(status),
        project,
        issueType: issueTypeObj?.name || 'Task',
        assigneeName: assignee?.displayName as string | undefined,
        assigneeAvatar: (assignee?.avatarUrls as Record<string, string>)?.['24x24'],
        labels: (f.labels as string[]) || [],
        iceScore: f.customfield_10016 as number | undefined,
        storyPoints: (f.story_points || f.customfield_10028 || f.customfield_10016) as number | undefined,
        startDate: f.customfield_10015 as string | undefined,
        dueDate: f.duedate as string | undefined,
        createdAt: f.created as string | undefined,
        updatedAt: f.updated as string | undefined,
        url: `${baseUrl}/browse/${issue.key}`,
      });
    }

    if (batch.length < maxResults) break;
    startAt += maxResults;
  }

  await trySetRedisCache(cacheKey, issues);
  return issues;
}

export async function fetchAllIssues(): Promise<JiraIssue[]> {
  const jql = 'project in (ZI, MEDICAL, WELLNESS, STRATEGY, LOGISTICS, "BIZ-OPS", PSS, WORKFORCE, "PRODUCT-HEALTH", ADMIN) ORDER BY updated DESC';
  return fetchJiraIssues(jql, 'jira:pipeline:all', 'summary,status,assignee,labels,project,customfield_10016,issuetype,created,updated,duedate,customfield_10015');
}

export async function fetchDomainIssues(projects: string[], labelFilter?: string): Promise<JiraIssue[]> {
  const projectList = projects.map(p => `"${p}"`).join(',');
  let jql = `project in (${projectList})`;
  if (labelFilter) {
    jql += ` AND labels = "${labelFilter}"`;
  }
  jql += ' ORDER BY updated DESC';
  const cacheKey = `jira:domain:${projects.join('-')}${labelFilter ? ':' + labelFilter : ''}`;
  return fetchJiraIssues(jql, cacheKey, 'summary,status,assignee,labels,project,customfield_10016,issuetype,created,updated,duedate,customfield_10015,customfield_10028');
}

export async function fetchEpics(): Promise<JiraIssue[]> {
  const jql = 'issuetype = Epic AND project in (ZI, "BIZ-OPS", STRATEGY, LOGISTICS) ORDER BY created DESC';
  return fetchJiraIssues(jql, 'jira:epics:all', 'summary,status,assignee,labels,project,issuetype,created,updated,duedate,customfield_10015');
}

export async function fetchSprintIssues(): Promise<JiraIssue[]> {
  const jql = 'project = ZI AND sprint in openSprints() ORDER BY status ASC';
  return fetchJiraIssues(jql, 'jira:sprint:zi', 'summary,status,assignee,labels,project,issuetype,customfield_10028,customfield_10016');
}
