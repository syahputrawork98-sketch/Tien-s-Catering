export type MockMenuItem = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image: string;
  stock: number;
};

export const mockMenus: MockMenuItem[] = [
  {
    id: 'nasi-box-ayam',
    name: 'Nasi Box Ayam Bakar Madu',
    description: 'Nasi box premium dengan ayam bakar madu, urap sayur segar, sambal bajak, dan kerupuk udang.',
    basePrice: 25000,
    category: 'Nasi Box',
    image: '/images/placeholder-menu.jpg',
    stock: 15
  },
  {
    id: 'nasi-box-empal',
    name: 'Nasi Box Empal Gentong',
    description: 'Nasi box dengan empal daging sapi empuk, serundeng, tahu tempe, dan sambal hijau.',
    basePrice: 35000,
    category: 'Nasi Box',
    image: '/images/placeholder-menu.jpg',
    stock: 8
  },
  {
    id: 'snack-box-premium',
    name: 'Snack Box Premium A',
    description: 'Paket 3 kue (Lemper, Risoles, Soes) + Air Mineral.',
    basePrice: 15000,
    category: 'Snack Box',
    image: '/images/placeholder-menu.jpg',
    stock: 50
  },
  {
    id: 'paket-prasmanan-a',
    name: 'Paket Prasmanan Executive',
    description: 'Layanan lengkap prasmanan untuk 100+ porsi dengan 7 pilihan menu utama.',
    basePrice: 75000,
    category: 'Prasmanan',
    image: '/images/placeholder-menu.jpg',
    stock: 100
  }
];


