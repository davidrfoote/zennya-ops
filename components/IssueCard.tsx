import type { JiraIssue } from '@/lib/jira';

const DOMAIN_COLORS: Record<string, { bg: string; color: string }> = {
  ZI: { bg: '#1e1b4b', color: '#a5b4fc' },
  MEDICAL: { bg: '#450a0a', color: '#fca5a5' },
  WELLNESS: { bg: '#052e16', color: '#86efac' },
  STRATEGY: { bg: '#422006', color: '#fde68a' },
  LOGISTICS: { bg: '#431407', color: '#fdba74' },
  'BIZ-OPS': { bg: '#3b0764', color: '#d8b4fe' },
  PSS: { bg: '#083344', color: '#67e8f9' },
  WORKFORCE: { bg: '#500724', color: '#fbcfe8' },
  'PRODUCT-HEALTH': { bg: '#042f2e', color: '#5eead4' },
  ADMIN: { bg: '#1f2937', color: '#d1d5db' },
};

interface IssueCardProps {
  issue: JiraIssue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const domainColor = DOMAIN_COLORS[issue.project] || { bg: '#1f2937', color: '#d1d5db' };
  return (
    <div
      style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '0.5rem',
        padding: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#818cf8', textDecoration: 'none' }}
        >
          {issue.key}
        </a>
        <span
          style={{
            fontSize: '0.6875rem',
            padding: '0.125rem 0.375rem',
            borderRadius: '0.25rem',
            backgroundColor: domainColor.bg,
            color: domainColor.color,
            fontFamily: 'monospace',
          }}
        >
          {issue.project}
        </span>
      </div>
      <p
        style={{
          color: '#e5e7eb',
          fontSize: '0.75rem',
          lineHeight: '1.4',
          marginBottom: '0.5rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {issue.summary}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {issue.assigneeName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {issue.assigneeAvatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={issue.assigneeAvatar} alt="" style={{ width: '1rem', height: '1rem', borderRadius: '50%' }} />
            )}
            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              {issue.assigneeName.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span style={{ color: '#4b5563', fontSize: '0.75rem' }}>Unassigned</span>
        )}
        {issue.iceScore != null && (
          <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            ICE: {issue.iceScore}
          </span>
        )}
      </div>
    </div>
  );
}
