'use client';
import { useState, useEffect, useCallback } from 'react';
import { JiraIssue } from '@/lib/jira';
import { DevSession } from '@/lib/opsdb';

interface Props {
  initialSprint: JiraIssue[];
  initialSessions: DevSession[];
  lastSynced: string;
}

const REFRESH = 5 * 60 * 1000;

const STATUS_GROUPS = [
  { label: 'To Do', stages: ['backlog', 'to-scope', 'ready', 'observation', 'triage'], color: '#6b7280' },
  { label: 'In Progress', stages: ['in-sprint'], color: '#6366f1' },
  { label: 'Blocked', stages: [], statuses: ['blocked', 'on hold'], color: '#ef4444' },
  { label: 'Done', stages: ['deployed'], color: '#22c55e' },
];

function statusBadgeColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'active') return '#22c55e';
  if (s === 'pending') return '#f59e0b';
  if (s === 'completed') return '#6b7280';
  return '#6366f1';
}

function elapsed(date: string) {
  const ms = Date.now() - new Date(date).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return `${Math.floor(m / 1440)}d`;
}

export default function ExecutionBoard({ initialSprint, initialSessions, lastSynced: initSync }: Props) {
  const [sprintIssues, setSprintIssues] = useState<JiraIssue[]>(initialSprint);
  const [sessions, setSessions] = useState<DevSession[]>(initialSessions);
  const [lastSynced, setLastSynced] = useState(initSync);

  const refresh = useCallback(async () => {
    const [sprintRes, sessRes] = await Promise.allSettled([
      fetch('/api/sprint').then(r => r.json()),
      fetch('/api/sessions').then(r => r.json()),
    ]);
    if (sprintRes.status === 'fulfilled' && sprintRes.value.issues) setSprintIssues(sprintRes.value.issues);
    if (sessRes.status === 'fulfilled' && sessRes.value.sessions) setSessions(sessRes.value.sessions);
    setLastSynced(new Date().toISOString());
  }, []);

  useEffect(() => {
    const t = setInterval(refresh, REFRESH);
    return () => clearInterval(t);
  }, [refresh]);

  const card = { background: '#111827', border: '1px solid #1f2937', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>Execution</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Synced {elapsed(lastSynced)}</span>
          <button onClick={refresh} style={{ fontSize: '0.75rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>↺ Refresh</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Sprint Board */}
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', marginBottom: '1rem' }}>ZI SPRINT BOARD</h2>
          {STATUS_GROUPS.map(group => {
            const groupIssues = sprintIssues.filter(i => {
              if (group.statuses) {
                return group.statuses.some(s => i.status.toLowerCase().includes(s));
              }
              return group.stages.includes(i.stage);
            });
            return (
              <div key={group.label} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: group.color, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af' }}>{group.label.toUpperCase()} ({groupIssues.length})</span>
                </div>
                {groupIssues.map(issue => (
                  <a key={issue.key} href={issue.url} target="_blank" rel="noreferrer" style={{ ...card, display: 'block', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6366f1' }}>{issue.key}</span>
                      {issue.storyPoints && <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>{issue.storyPoints}pt</span>}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#e5e7eb', marginTop: '0.125rem', lineHeight: 1.4 }}>{issue.summary}</div>
                    {issue.assigneeName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem' }}>
                        {issue.assigneeAvatar && <img src={issue.assigneeAvatar} alt="" style={{ width: '1rem', height: '1rem', borderRadius: '50%' }} />}
                        <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>{issue.assigneeName}</span>
                      </div>
                    )}
                  </a>
                ))}
                {groupIssues.length === 0 && <div style={{ fontSize: '0.75rem', color: '#374151', padding: '0.375rem' }}>Empty</div>}
              </div>
            );
          })}
        </div>

        {/* AI Dev Sessions */}
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', marginBottom: '1rem' }}>LIVE AI DEV SESSIONS ({sessions.length})</h2>
          {sessions.map(s => (
            <a key={s.session_id} href={`https://dev-sessions.ash.zennya.app/sessions/${s.session_id}`} target="_blank" rel="noreferrer"
              style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.session_id}</span>
                <span style={{
                  fontSize: '0.625rem', padding: '0.125rem 0.5rem', borderRadius: '9999px',
                  background: statusBadgeColor(s.status) + '22', color: statusBadgeColor(s.status), fontWeight: 600
                }}>{s.status}</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#e5e7eb', marginTop: '0.25rem' }}>{s.title || '(untitled)'}</div>
              <div style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.25rem' }}>Started {elapsed(s.created_at)} ago</div>
            </a>
          ))}
          {sessions.length === 0 && <div style={{ color: '#4b5563', fontSize: '0.875rem', padding: '1rem 0' }}>No active sessions</div>}
        </div>
      </div>
    </div>
  );
}
