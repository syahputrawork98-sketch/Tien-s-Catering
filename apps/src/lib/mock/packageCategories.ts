// ============================================================
// packageCategories.ts — Mock Data Kategori Paket
// Entity kategori untuk paket catering (UI-only simulation)
// ============================================================

export type MockPackageCategoryStatus = 'active' | 'inactive';

export type MockPackageCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: MockPackageCategoryStatus;
  createdBy: 'admin';
  createdAt: string;
  updatedAt: string;
  updatedBy?: 'admin';
  adminNote?: string;
};

export const mockPackageCategories: MockPackageCategory[] = [
  {
    id: 'cat-nasi-box',
    name: 'Nasi Box',
    slug: 'nasi-box',
    description: 'Paket nasi box untuk kantor, acara keluarga, dan kebutuhan harian.',
    status: 'active',
    createdBy: 'admin',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'cat-snack-box',
    name: 'Snack Box',
    slug: 'snack-box',
    description: 'Paket snack box untuk meeting, seminar, dan arisan.',
    status: 'active',
    createdBy: 'admin',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'cat-prasmanan',
    name: 'Prasmanan',
    slug: 'prasmanan',
    description: 'Paket prasmanan untuk acara besar dan gathering.',
    status: 'active',
    createdBy: 'admin',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'cat-corporate',
    name: 'Meeting/Corporate',
    slug: 'meeting-corporate',
    description: 'Paket catering untuk meeting, training, dan kebutuhan perusahaan.',
    status: 'active',
    createdBy: 'admin',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'cat-wedding',
    name: 'Event/Wedding',
    slug: 'event-wedding',
    description: 'Paket catering untuk wedding, engagement, dan event besar.',
    status: 'active',
    createdBy: 'admin',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'cat-custom',
    name: 'Custom',
    slug: 'custom',
    description: 'Kategori paket fleksibel sesuai kebutuhan customer.',
    status: 'active',
    createdBy: 'admin',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01'
  }
];

// ─── Helpers ───────────────────────────────────────────────

export function getActivePackageCategories() {
  return mockPackageCategories.filter(cat => cat.status === 'active');
}

export function slugifyCategoryName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
