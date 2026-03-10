'use client';

interface FilterState {
  project: string;
  label: string;
  assignee: string;
}

interface FilterBarProps {
  projects: string[];
  labels: string[];
  assignees: string[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const selectStyle = {
  backgroundColor: '#374151',
  color: '#e5e7eb',
  fontSize: '0.75rem',
  borderRadius: '0.375rem',
  padding: '0.25rem 0.5rem',
  border: '1px solid #4b5563',
};

export default function FilterBar({ projects, labels, assignees, filters, onChange }: FilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#1f2937',
        borderBottom: '1px solid #374151',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      <select
        style={selectStyle}
        value={filters.project}
        onChange={(e) => onChange({ ...filters, project: e.target.value })}
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <select
        style={selectStyle}
        value={filters.label}
        onChange={(e) => onChange({ ...filters, label: e.target.value })}
      >
        <option value="">All Labels</option>
        {labels.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <select
        style={selectStyle}
        value={filters.assignee}
        onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
      >
        <option value="">All Assignees</option>
        {assignees.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}
