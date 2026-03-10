'use client';
import { useState, useMemo, useEffect } from 'react';
import type { JiraIssue, PipelineStage } from '@/lib/jira';
import StageColumn from './StageColumn';
import FilterBar from './FilterBar';

const STAGES: PipelineStage[] = [
  'observation',
  'triage',
  'backlog',
  'to-scope',
  'ready',
  'in-sprint',
  'deployed',
];

interface PipelineBoardProps {
  initialIssues: JiraIssue[];
  lastSynced: string;
}

export default function PipelineBoard({ initialIssues }: PipelineBoardProps) {
  const [issues, setIssues] = useState<JiraIssue[]>(initialIssues);
  const [filters, setFilters] = useState({ project: '', label: '', assignee: '' });

  // Auto-refresh every 5 min
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/issues');
        const data = await res.json();
        if (data.issues) setIssues(data.issues);
      } catch (e) {
        console.error('Refresh error', e);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const projects = useMemo(() => [...new Set(issues.map((i) => i.project))].sort(), [issues]);
  const labels = useMemo(
    () => [...new Set(issues.flatMap((i) => i.labels))].sort(),
    [issues]
  );
  const assignees = useMemo(
    () =>
      [
        ...new Set(
          issues.map((i) => i.assigneeName).filter((a): a is string => Boolean(a))
        ),
      ].sort(),
    [issues]
  );

  const filtered = useMemo(() => {
    return issues.filter((issue) => {
      if (filters.project && issue.project !== filters.project) return false;
      if (filters.label && !issue.labels.includes(filters.label)) return false;
      if (filters.assignee && issue.assigneeName !== filters.assignee) return false;
      return true;
    });
  }, [issues, filters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <FilterBar
        projects={projects}
        labels={labels}
        assignees={assignees}
        filters={filters}
        onChange={setFilters}
      />
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          padding: '1rem',
          overflowX: 'auto',
          flex: 1,
        }}
      >
        {STAGES.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            issues={filtered.filter((i) => i.stage === stage)}
          />
        ))}
      </div>
    </div>
  );
}
