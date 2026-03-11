import { NextResponse } from 'next/server';
import { fetchEpics } from '@/lib/jira';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const issues = await fetchEpics();
    return NextResponse.json({ issues });
  } catch (e) {
    console.error('epics error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
