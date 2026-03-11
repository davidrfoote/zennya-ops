'use client';
import { useState, useEffect, useCallback } from 'react';
import { JiraIssue } from '@/lib/jira';
import { DomainConfig } from '@/lib/domains';

interface Props {
  domain: string;
  config: DomainConfig;
  initialIssues: JiraIssue[];
  lastSynced: string;
}

const REFRESH_INTERVAL = 5 * 60 * 1000;

function elapsed(date: string) {
  const ms = Date.now() - new Date(date).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function DomainView({ domain, config, initialIssues, lastSynced: initSync }: Props) {
  const [issues, setIssues] = useState<JiraIssue[]>(initialIssues);
  const [lastSynced, setLastSynced] = useState(initSync);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/domain-issues?domain=${domain}`);
      const data = await res.json();
      if (data.issues) {
        setIssues(data.issues);
        setLastSynced(new Date().toISOString());
      }
    } catch (e) {
      console.error('refresh error:', e);
    }
  }, [domain]);

  useEffect(() => {
    const t = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(t);
  }, [refresh]);

  const epics = issues.filter(i => i.issueType === 'Epic');
  const triageQueue = issues.filter(i =>
    (i.status === 'Observation' || i.status === 'Backlog' || i.stage === 'observation' || i.stage === 'backlog') &&
    !i.iceScore && i.labels.includes('needs-triage')
  );
  const recentActivity = [...issues]
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 10);

  const kpis = [
    { label: 'Total Issues', value: issues.length },
    { label: 'In Triage', value: issues.filter(i => i.stage === 'triage' || i.stage === 'observation').length },
    { label: 'Active Epics', value: epics.filter(e => e.stage !== 'deployed').length },
    { label: 'Deployed This Month', value: issues.filter(i => {
      if (i.stage !== 'deployed') return false;
      const d = new Date(i.updatedAt || 0);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length },
  ];

  const card = {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '0.75rem',
    padding: '1rem',
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{config.label}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Synced {elapsed(lastSynced)}</span>
          <button onClick={refresh} style={{ fontSize: '0.75rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>↺ Refresh</button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={card}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{kpi.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Active Epics */}
        <div style={card}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.75rem' }}>ACTIVE EPICS ({epics.filter(e => e.stage !== 'deployed').length})</h2>
          {epics.filter(e => e.stage !== 'deployed').slice(0, 10).map(epic => (
            <a key={epic.key} href={epic.url} target="_blank" rel="noreferrer"
              style={{ display: 'block', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '0.25rem', background: '#1f2937', textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#6366f1' }}>{epic.key}</span>
                <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '9999px', background: '#374151', color: '#9ca3af' }}>{epic.status}</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#e5e7eb', marginTop: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{epic.summary}</div>
            </a>
          ))}
          {epics.filter(e => e.stage !== 'deployed').length === 0 && <div style={{ color: '#4b5563', fontSize: '0.875rem' }}>No active epics</div>}
        </div>

        {/* Triage Queue */}
        <div style={card}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.75rem' }}>TRIAGE QUEUE ({triageQueue.length})</h2>
          {triageQueue.slice(0, 10).map(issue => (
            <a key={issue.key} href={issue.url} target="_blank" rel="noreferrer"
              style={{ display: 'block', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '0.25rem', background: '#1f2937', textDecoration: 'none' }}>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{issue.key}</span>
              <div style={{ fontSize: '0.8125rem', color: '#e5e7eb', marginTop: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.summary}</div>
            </a>
          ))}
          {triageQueue.length === 0 && <div style={{ color: '#4b5563', fontSize: '0.875rem' }}>No issues in triage queue</div>}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ ...card, marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.75rem' }}>RECENT ACTIVITY</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1f2937' }}>
              {['Key', 'Summary', 'Status', 'Updated'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.375rem 0.5rem', color: '#6b7280', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentActivity.map(issue => (
              <tr key={issue.key} style={{ borderBottom: '1px solid #111827' }}>
                <td style={{ padding: '0.375rem 0.5rem' }}>
                  <a href={issue.url} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>{issue.key}</a>
                </td>
                <td style={{ padding: '0.375rem 0.5rem', color: '#e5e7eb', maxWidth: '20rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.summary}</td>
                <td style={{ padding: '0.375rem 0.5rem' }}>
                  <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '9999px', background: '#374151', color: '#9ca3af' }}>{issue.status}</span>
                </td>
                <td style={{ padding: '0.375rem 0.5rem', color: '#6b7280' }}>{issue.updatedAt ? elapsed(issue.updatedAt) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
