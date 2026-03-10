import { NextResponse } from 'next/server';
import { fetchAllIssues } from '@/lib/jira';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const issues = await fetchAllIssues();
    return NextResponse.json({ issues, lastSynced: new Date().toISOString() });
  } catch (err) {
    console.error('Issues API error:', err);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}
