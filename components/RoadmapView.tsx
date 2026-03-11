'use client';
import { useState, useEffect, useCallback } from 'react';
import { JiraIssue } from '@/lib/jira';

interface Props {
  initialEpics: JiraIssue[];
  lastSynced: string;
}

const REFRESH = 5 * 60 * 1000;

const PROJECT_COLORS: Record<string, string> = {
  ZI: '#6366f1', MEDOPS: '#ec4899', MS2: '#f59e0b', DPH: '#06b6d4',
  LOG: '#22c55e', ADMIN: '#8b5cf6', 'BIZ-OPS': '#f97316',
  STRATEGY: '#14b8a6', PSS: '#84cc16', MKTG: '#a78bfa',
  WELLNESS: '#fb923c', 'PRODUCT-HEALTH': '#e879f9',
};

function projectColor(key: string) {
  return PROJECT_COLORS[key] || '#6b7280';
}

function parseDate(d: string | undefined, fallback: Date): Date {
  if (!d) return fallback;
  const p = new Date(d);
  return isNaN(p.getTime()) ? fallback : p;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function elapsed(date: string) {
  const ms = Date.now() - new Date(date).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function RoadmapView({ initialEpics, lastSynced: initSync }: Props) {
  const [epics, setEpics] = useState<JiraIssue[]>(initialEpics);
  const [lastSynced, setLastSynced] = useState(initSync);
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const refresh = useCallback(async () => {
    const res = await fetch('/api/epics').then(r => r.json());
    if (res.issues) { setEpics(res.issues); setLastSynced(new Date().toISOString()); }
  }, []);

  useEffect(() => {
    const t = setInterval(refresh, REFRESH);
    return () => clearInterval(t);
  }, [refresh]);

  const projects = [...new Set(epics.map(e => e.project))].sort();
  const statuses = [...new Set(epics.map(e => e.status))].sort();

  const filtered = epics.filter(e => {
    if (filterProject && e.project !== filterProject) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    return true;
  });

  // Gantt range: current quarter start to end of next quarter
  const now = new Date();
  const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const qEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 6, 0);
  const totalDays = daysBetween(qStart, qEnd);

  function xPercent(d: Date) {
    const clamped = Math.max(qStart.getTime(), Math.min(qEnd.getTime(), d.getTime()));
    return (daysBetween(qStart, new Date(clamped)) / totalDays) * 100;
  }

  // Month markers
  const months: { label: string; pct: number }[] = [];
  const cur = new Date(qStart);
  while (cur <= qEnd) {
    months.push({ label: cur.toLocaleString('default', { month: 'short', year: '2-digit' }), pct: xPercent(new Date(cur)) });
    cur.setMonth(cur.getMonth() + 1);
  }

  const selectStyle = {
    background: '#1f2937', border: '1px solid #374151', borderRadius: '0.375rem',
    color: '#e5e7eb', padding: '0.25rem 0.5rem', fontSize: '0.8125rem', cursor: 'pointer',
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>Roadmap</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={selectStyle}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Synced {elapsed(lastSynced)}</span>
          <button onClick={refresh} style={{ fontSize: '0.75rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>↺ Refresh</button>
        </div>
      </div>

      {/* Gantt */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '0.75rem', overflow: 'hidden' }}>
        {/* Month header */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1f2937', position: 'relative', height: '2rem', marginLeft: '16rem' }}>
          {months.map(m => (
            <div key={m.label} style={{
              position: 'absolute', left: `${m.pct}%`, top: 0, bottom: 0,
              display: 'flex', alignItems: 'center', paddingLeft: '0.5rem',
              fontSize: '0.75rem', color: '#6b7280', borderLeft: '1px solid #1f2937',
            }}>{m.label}</div>
          ))}
          {/* today line */}
          <div style={{
            position: 'absolute', left: `${xPercent(now)}%`, top: 0, bottom: 0,
            borderLeft: '2px solid #6366f1', zIndex: 2,
          }} />
        </div>

        {/* Rows */}
        {filtered.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#4b5563' }}>No epics found</div>
        )}
        {filtered.map((epic) => {
          const start = parseDate(epic.startDate, new Date(epic.createdAt || Date.now()));
          const hasEnd = !!epic.dueDate;
          const end = parseDate(epic.dueDate, new Date(qEnd));
          const x1 = xPercent(start);
          const x2 = hasEnd ? xPercent(end) : 100;
          const width = Math.max(x2 - x1, 0.5);
          const color = projectColor(epic.project);

          return (
            <div key={epic.key} style={{ display: 'flex', borderBottom: '1px solid #1f2937', alignItems: 'center', height: '2.5rem' }}>
              {/* Label */}
              <div style={{ width: '16rem', minWidth: '16rem', padding: '0 0.75rem', overflow: 'hidden' }}>
                <a href={epic.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <span style={{ fontSize: '0.625rem', color }}>●</span>{' '}
                  <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>{epic.key}</span>{' '}
                  <span style={{ fontSize: '0.75rem', color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{epic.summary}</span>
                </a>
              </div>
              {/* Bar area */}
              <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                {/* today line */}
                <div style={{
                  position: 'absolute', left: `${xPercent(now)}%`, top: 0, bottom: 0,
                  borderLeft: '1px solid #4f46e588', zIndex: 1,
                }} />
                {/* Gantt bar */}
                <div style={{
                  position: 'absolute',
                  left: `${x1}%`,
                  width: `${width}%`,
                  top: '50%', transform: 'translateY(-50%)',
                  height: '1.125rem',
                  background: color + 'cc',
                  borderRadius: '0.25rem',
                  border: `1px solid ${color}`,
                  ...(hasEnd ? {} : { borderRight: `2px dashed ${color}`, background: color + '66' }),
                  zIndex: 2,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {projects.map(p => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: '0.125rem', background: projectColor(p), display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{p}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ width: '1rem', height: '0.75rem', borderRadius: '0.125rem', background: '#6b757066', border: '1px dashed #6b7280', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>open-ended</span>
        </div>
      </div>
    </div>
  );
}
