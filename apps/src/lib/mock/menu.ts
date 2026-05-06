// ============================================================
// menu.ts — Adapter compatibility untuk public katalog
// Data berasal dari catalog.ts (single source of truth)
// ============================================================

import { mockCatalogItems } from './catalog';

export type MockMenuItem = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image: string;
  stock: number;
};

// Derive dari catalog.ts — filter hanya item type 'menu'
export const mockMenus: MockMenuItem[] = mockCatalogItems
  .filter(item => item.type === 'menu')
  .map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    basePrice: item.basePrice,
    category: item.category,
    image: item.image || '/images/placeholder-menu.jpg',
    stock: item.dailyStock ?? 0
  }));
