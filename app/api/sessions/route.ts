import { NextResponse } from 'next/server';
import { fetchActiveSessions } from '@/lib/opsdb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessions = await fetchActiveSessions();
    return NextResponse.json({ sessions });
  } catch (e) {
    console.error('sessions error:', e);
    return NextResponse.json({ sessions: [], error: String(e) });
  }
}
