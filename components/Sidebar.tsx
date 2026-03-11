'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const DOMAIN_ITEMS = [
  { label: 'Medical', href: '/domains/medical' },
  { label: 'Wellness', href: '/domains/wellness' },
  { label: 'Logistics', href: '/domains/logistics' },
  { label: 'Biz-Ops', href: '/domains/biz-ops' },
  { label: 'Strategy', href: '/domains/strategy' },
];

const navItems = [
  { label: 'Pipeline', href: '/', icon: '⬡' },
  { label: 'Domains', href: '/domains', icon: '🗂️', children: DOMAIN_ITEMS },
  { label: 'Execution', href: '/execution', icon: '⚡' },
  { label: 'Roadmap', href: '/roadmap', icon: '📊' },
  { label: 'Capacity', href: '/capacity', icon: '👥' },
];

const activeStyle = { backgroundColor: '#4f46e5', color: 'white' };
const inactiveStyle = { color: '#9ca3af' };

export default function Sidebar() {
  const pathname = usePathname();
  const [domainsOpen, setDomainsOpen] = useState(pathname.startsWith('/domains'));

  return (
    <aside
      style={{ width: '14rem', minHeight: '100vh', backgroundColor: '#111827', borderRight: '1px solid #1f2937' }}
      className="flex flex-col"
    >
      <div style={{ padding: '1rem', borderBottom: '1px solid #1f2937' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: '1.125rem' }}>Zennya Ops</span>
      </div>
      <nav style={{ flex: 1, padding: '0.75rem' }}>
        {navItems.map((item) => {
          if (item.children) {
            const isActive = pathname.startsWith('/domains');
            return (
              <div key={item.href} style={{ marginBottom: '0.25rem' }}>
                <button
                  onClick={() => setDomainsOpen(!domainsOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                    fontSize: '0.875rem', width: '100%', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    ...(isActive ? activeStyle : inactiveStyle),
                  }}
                >
                  <span>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: '0.75rem' }}>{domainsOpen ? '▾' : '▸'}</span>
                </button>
                {domainsOpen && (
                  <div style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        style={{
                          display: 'block', padding: '0.375rem 0.75rem',
                          borderRadius: '0.375rem', fontSize: '0.8125rem',
                          textDecoration: 'none', marginBottom: '0.125rem',
                          ...(pathname === child.href ? activeStyle : inactiveStyle),
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <div key={item.href} style={{ marginBottom: '0.25rem' }}>
              <Link
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  fontSize: '0.875rem', textDecoration: 'none',
                  ...(isActive ? activeStyle : inactiveStyle),
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
