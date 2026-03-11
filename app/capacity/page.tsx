import TopBar from '@/components/TopBar';

export const dynamic = 'force-dynamic';

export default function CapacityPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar lastSynced={new Date().toISOString()} />
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>Capacity</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {[
            { label: 'Active Developers', value: '6' },
            { label: 'Sprint Velocity (avg)', value: '—' },
            { label: 'Available This Week', value: '—' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{stat.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>{stat.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2rem', background: '#111827', border: '1px solid #1f2937', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#4b5563' }}>
          Capacity tracking coming soon
        </div>
      </div>
    </div>
  );
}
