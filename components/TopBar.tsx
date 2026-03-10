interface TopBarProps {
  lastSynced?: string;
}

export default function TopBar({ lastSynced }: TopBarProps) {
  const formatted = lastSynced
    ? new Date(lastSynced).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '—';
  return (
    <header
      style={{
        height: '3rem',
        backgroundColor: '#111827',
        borderBottom: '1px solid #1f2937',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Pipeline Funnel</span>
      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Last synced: {formatted}</span>
    </header>
  );
}
