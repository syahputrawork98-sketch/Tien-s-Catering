export type MockPackage = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  suitableFor: string[];
  features: string[];
};

export const mockPackages: MockPackage[] = [
  {
    id: 'pkg-nasi-box',
    name: 'Paket Nasi Box',
    description: 'Menu lengkap dalam box higienis, sangat cocok untuk makan siang kantor atau acara lapangan.',
    basePrice: 25000,
    suitableFor: ['Kantor', 'Acara Lapangan', 'Syukuran'],
    features: ['Nasi Putih/Kuning', 'Lauk Utama', 'Sayuran', 'Sambal & Kerupuk', 'Buah Potong']
  },
  {
    id: 'pkg-snack-box',
    name: 'Paket Snack Box',
    description: 'Pilihan kue tradisional dan modern premium untuk menemani meeting atau coffee break.',
    basePrice: 15000,
    suitableFor: ['Meeting', 'Seminar', 'Arisan'],
    features: ['3 Pilihan Kue', 'Air Mineral', 'Tissue & Sedotan']
  },
  {
    id: 'pkg-prasmanan',
    name: 'Paket Prasmanan',
    description: 'Layanan prasmanan lengkap dengan peralatan dan pramusaji profesional.',
    basePrice: 65000,
    suitableFor: ['Pernikahan', 'Gathering Kantor', 'Ulang Tahun'],
    features: ['Menu Lengkap', 'Peralatan Makan', 'Pramusaji', 'Dekorasi Meja']
  },
  {
    id: 'pkg-meeting',
    name: 'Paket Meeting Kantor',
    description: 'Kombinasi makan siang dan snack box yang dirancang khusus untuk produktivitas tim.',
    basePrice: 45000,
    suitableFor: ['Rapat Direksi', 'Workshop', 'Training'],
    features: ['Makan Siang Box', 'Coffee Break', 'Air Mineral Botol']
  },
  {
    id: 'pkg-instansi',
    name: 'Paket Sekolah / Instansi',
    description: 'Menu bergizi seimbang dengan harga kompetitif untuk kebutuhan rutin institusi.',
    basePrice: 20000,
    suitableFor: ['Sekolah', 'Pemerintahan', 'Yayasan'],
    features: ['Menu Sehat', 'Porsi Pas', 'Pengiriman Tepat Waktu']
  },
  {
    id: 'pkg-custom',
    name: 'Paket Custom',
    description: 'Sesuaikan budget dan menu impian Anda dengan konsultasi langsung bersama chef kami.',
    basePrice: 50000,
    suitableFor: ['Acara Khusus', 'Diet Spesifik', 'VIP Guest'],
    features: ['Konsultasi Menu', 'Food Testing', 'Flexible Budget']
  }
];
