import { NextResponse } from 'next/server';
import { fetchSprintIssues } from '@/lib/jira';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const issues = await fetchSprintIssues();
    return NextResponse.json({ issues });
  } catch (e) {
    console.error('sprint error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
