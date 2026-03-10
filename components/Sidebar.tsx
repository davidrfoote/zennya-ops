'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Pipeline', href: '/', icon: '⬡' },
  { label: 'Sprint Board', href: '/sprint', icon: '📋', disabled: true },
  { label: 'Gantt', href: '/gantt', icon: '📊', disabled: true },
  { label: 'Capacity', href: '/capacity', icon: '👥', disabled: true },
  { label: 'Triage Queue', href: '/triage', icon: '🔍', disabled: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      style={{ width: '14rem', minHeight: '100vh', backgroundColor: '#111827', borderRight: '1px solid #1f2937' }}
      className="flex flex-col"
    >
      <div style={{ padding: '1rem', borderBottom: '1px solid #1f2937' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '1.125rem' }}>Zennya Ops</span>
      </div>
      <nav style={{ flex: 1, padding: '0.75rem' }}>
        {navItems.map((item) => (
          <div key={item.href} style={{ marginBottom: '0.25rem' }}>
            {item.disabled ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  color: '#4b5563',
                  cursor: 'not-allowed',
                  fontSize: '0.875rem',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#374151' }}>soon</span>
              </div>
            ) : (
              <Link
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  backgroundColor: pathname === item.href ? '#4f46e5' : 'transparent',
                  color: pathname === item.href ? 'white' : '#9ca3af',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
