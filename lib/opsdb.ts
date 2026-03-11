import { Pool } from 'pg';

let pool: Pool | null = null;

export function getOpsDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.OPS_DATABASE_URL || 'postgresql://ops:Pi5cSfj9ASfNoBBklkGUR65uBazG6iNn@prod_ops-db:5432/ops',
    });
  }
  return pool;
}

export interface DevSession {
  session_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export async function fetchActiveSessions(): Promise<DevSession[]> {
  const db = getOpsDb();
  const res = await db.query<DevSession>(
    `SELECT session_id, title, status, created_at, updated_at
     FROM sessions
     WHERE status IN ('active','pending')
     ORDER BY created_at DESC
     LIMIT 20`
  );
  return res.rows;
}
