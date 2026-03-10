import type { JiraIssue } from '@/lib/jira';
import IssueCard from './IssueCard';

const STAGE_LABELS: Record<string, string> = {
  observation: 'Observation',
  triage: 'Triage',
  backlog: 'Backlog',
  'to-scope': 'To Scope',
  ready: 'Ready',
  'in-sprint': 'In Sprint',
  deployed: 'Deployed',
};

interface StageColumnProps {
  stage: string;
  issues: JiraIssue[];
}

export default function StageColumn({ stage, issues }: StageColumnProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '220px',
        maxWidth: '220px',
        backgroundColor: '#111827',
        borderRadius: '0.5rem',
        border: '1px solid #1f2937',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: 500 }}>
          {STAGE_LABELS[stage] || stage}
        </span>
        <span
          style={{
            backgroundColor: '#374151',
            color: '#9ca3af',
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            fontFamily: 'monospace',
          }}
        >
          {issues.length}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxHeight: 'calc(100vh - 200px)',
        }}
      >
        {issues.length === 0 ? (
          <p style={{ color: '#4b5563', fontSize: '0.75rem', textAlign: 'center', paddingTop: '1rem' }}>
            No issues
          </p>
        ) : (
          issues.map((issue) => <IssueCard key={issue.key} issue={issue} />)
        )}
      </div>
    </div>
  );
}
