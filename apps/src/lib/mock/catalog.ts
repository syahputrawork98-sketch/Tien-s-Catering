export type CatalogItemType = 'daily-menu' | 'package';

export type CatalogItemStatus = 'active' | 'inactive' | 'sold_out' | 'draft';

export type CatalogItem = {
  id: string;
  type: CatalogItemType;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  image?: string;
  isActive: boolean;
  isAvailable: boolean;
  status: CatalogItemStatus;
  tags?: string[];
  features?: string[];
  suitableFor?: string[];
  createdAt: string;
  updatedAt: string;

  // khusus menu harian
  activeDate?: string;
  stockLabel?: string;
  dailyStock?: number;

  // khusus paket
  packageCategory?: string;
  minPax?: number;
  packageItems?: string[];
};

export const mockCatalogItems: CatalogItem[] = [
  // DAILY MENUS (From cs.ts logic)
  {
    id: 'MENU-001',
    type: 'daily-menu',
    name: 'Nasi Box Ayam Bakar',
    slug: 'nasi-box-ayam-bakar',
    description: 'Nasi box dengan ayam bakar bumbu rempah spesial, sambal terasi, dan lalapan segar.',
    category: 'Nasi Box',
    basePrice: 25000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
    isActive: true,
    isAvailable: true,
    status: 'active',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-06',
    activeDate: '2026-05-06',
    stockLabel: 'Tersedia',
    dailyStock: 50
  },
  {
    id: 'MENU-002',
    type: 'daily-menu',
    name: 'Snack Box Arisan',
    slug: 'snack-box-arisan',
    description: 'Paket snack isi 3 macam kue (lemper, risoles, sus fruit) dan air mineral.',
    category: 'Snack Box',
    basePrice: 15000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
    isActive: true,
    isAvailable: true,
    status: 'active',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-06',
    activeDate: '2026-05-06',
    stockLabel: 'Tersedia terbatas',
    dailyStock: 20
  },
  {
    id: 'MENU-003',
    type: 'daily-menu',
    name: 'Prasmanan Premium',
    slug: 'prasmanan-premium',
    description: 'Menu prasmanan lengkap dengan pilihan lauk daging, ayam, ikan, dan sayuran.',
    category: 'Prasmanan',
    basePrice: 65000,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
    isActive: true,
    isAvailable: false,
    status: 'sold_out',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-06',
    activeDate: '2026-05-06',
    stockLabel: 'Habis',
    dailyStock: 0
  },
  {
    id: 'MENU-005',
    type: 'daily-menu',
    name: 'Es Teh Manis',
    slug: 'es-teh-manis',
    description: 'Es teh manis segar dengan gula asli.',
    category: 'Minuman',
    basePrice: 5000,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
    isActive: true,
    isAvailable: true,
    status: 'active',
    createdAt: '2026-05-01',
    updatedAt: '2026-05-05',
    activeDate: '2026-05-05',
    stockLabel: 'Tersedia',
    dailyStock: 100
  },

  // PACKAGES (From packages.ts)
  {
    id: 'pkg-nasi-box',
    type: 'package',
    name: 'Paket Nasi Box Hemat',
    slug: 'paket-nasi-box-hemat',
    description: 'Menu lengkap dalam box higienis, sangat cocok untuk makan siang kantor atau acara lapangan.',
    category: 'Nasi Box',
    packageCategory: 'Nasi Box',
    basePrice: 25000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
    isActive: true,
    isAvailable: true,
    status: 'active',
    minPax: 20,
    suitableFor: ['Kantor', 'Acara Lapangan', 'Syukuran'],
    features: ['Nasi Putih/Kuning', 'Lauk Utama', 'Sayuran', 'Sambal & Kerupuk'],
    packageItems: ['Nasi', 'Ayam Goreng', 'Tumis Buncis', 'Sambal', 'Kerupuk'],
    createdAt: '2026-04-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'pkg-snack-box',
    type: 'package',
    name: 'Paket Snack Box Premium',
    slug: 'paket-snack-box-premium',
    description: 'Pilihan kue tradisional dan modern premium untuk menemani meeting atau coffee break.',
    category: 'Snack Box',
    packageCategory: 'Snack Box',
    basePrice: 15000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
    isActive: true,
    isAvailable: true,
    status: 'active',
    minPax: 15,
    suitableFor: ['Meeting', 'Seminar', 'Arisan'],
    features: ['3 Pilihan Kue', 'Air Mineral', 'Tissue & Sedotan'],
    packageItems: ['Lapis Legit', 'Risoles Mayo', 'Sus Buah', 'Air Mineral'],
    createdAt: '2026-04-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'pkg-prasmanan',
    type: 'package',
    name: 'Paket Prasmanan Mewah',
    slug: 'paket-prasmanan-mewah',
    description: 'Layanan prasmanan lengkap dengan peralatan dan pramusaji profesional.',
    category: 'Prasmanan',
    packageCategory: 'Prasmanan',
    basePrice: 65000,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
    isActive: true,
    isAvailable: true,
    status: 'active',
    minPax: 50,
    suitableFor: ['Pernikahan', 'Gathering Kantor', 'Ulang Tahun'],
    features: ['Menu Lengkap', 'Peralatan Makan', 'Pramusaji', 'Dekorasi Meja'],
    packageItems: ['Nasi Putih', 'Daging Teriyaki', 'Ayam Bakar', 'Capcay', 'Sop Kimlo', 'Buah Segar', 'Puding'],
    createdAt: '2026-04-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'pkg-meeting',
    type: 'package',
    name: 'Paket Meeting Corporate',
    slug: 'paket-meeting-corporate',
    description: 'Kombinasi makan siang dan snack box yang dirancang khusus untuk produktivitas tim.',
    category: 'Meeting/Corporate',
    packageCategory: 'Meeting/Corporate',
    basePrice: 45000,
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=500&q=80',
    isActive: true,
    isAvailable: true,
    status: 'active',
    minPax: 10,
    suitableFor: ['Rapat Direksi', 'Workshop', 'Training'],
    features: ['Makan Siang Box', 'Coffee Break', 'Air Mineral Botol'],
    packageItems: ['Lunch Box Premium', 'Snack Box', 'Infused Water', 'Kopi/Teh'],
    createdAt: '2026-04-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'pkg-wedding',
    type: 'package',
    name: 'Paket Wedding Silver',
    slug: 'paket-wedding-silver',
    description: 'Paket pernikahan ekonomis dengan rasa dan pelayanan tetap premium.',
    category: 'Event/Wedding',
    packageCategory: 'Event/Wedding',
    basePrice: 85000,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80',
    isActive: false,
    isAvailable: true,
    status: 'inactive',
    minPax: 200,
    suitableFor: ['Resepsi Pernikahan', 'Tunangan'],
    features: ['Gubukan 3 Macam', 'Buffet Utama', 'Pelaminan Standar', 'Janur'],
    packageItems: ['Buffet Utama', 'Bakso Malang', 'Sate Ayam', 'Es Puter'],
    createdAt: '2026-04-01',
    updatedAt: '2026-05-01'
  },
  {
    id: 'pkg-custom',
    type: 'package',
    name: 'Custom Event Package',
    slug: 'custom-event-package',
    description: 'Sesuaikan budget dan menu impian Anda dengan konsultasi langsung bersama chef kami.',
    category: 'Custom',
    packageCategory: 'Custom',
    basePrice: 50000,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80',
    isActive: true,
    isAvailable: true,
    status: 'active',
    minPax: 1,
    suitableFor: ['Acara Khusus', 'Diet Spesifik', 'VIP Guest'],
    features: ['Konsultasi Menu', 'Food Testing', 'Flexible Budget'],
    createdAt: '2026-04-01',
    updatedAt: '2026-05-01'
  }
];
