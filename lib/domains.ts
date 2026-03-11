export type DomainKey = 'medical' | 'wellness' | 'logistics' | 'biz-ops' | 'strategy';

export interface DomainConfig {
  label: string;
  projects: string[];
  labelFilter?: string;
}

export const DOMAINS: Record<DomainKey, DomainConfig> = {
  medical: {
    label: 'Medical',
    projects: ['MEDOPS', 'MS2', 'DPH'],
  },
  wellness: {
    label: 'Wellness',
    projects: ['ZI', 'PRODUCT-HEALTH'],
    labelFilter: 'wellness',
  },
  logistics: {
    label: 'Logistics',
    projects: ['LOG'],
  },
  'biz-ops': {
    label: 'Biz-Ops',
    projects: ['BIZ-OPS', 'ADMIN'],
  },
  strategy: {
    label: 'Strategy',
    projects: ['STRATEGY', 'PSS', 'MKTG'],
  },
};

export function getDomain(key: string): DomainConfig | null {
  return DOMAINS[key as DomainKey] || null;
}
