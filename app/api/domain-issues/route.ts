import { NextRequest, NextResponse } from 'next/server';
import { fetchDomainIssues } from '@/lib/jira';
import { getDomain } from '@/lib/domains';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain');
  if (!domain) return NextResponse.json({ error: 'Missing domain' }, { status: 400 });

  const config = getDomain(domain);
  if (!config) return NextResponse.json({ error: 'Unknown domain' }, { status: 404 });

  try {
    const issues = await fetchDomainIssues(config.projects, config.labelFilter);
    return NextResponse.json({ issues });
  } catch (e) {
    console.error('domain-issues error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
