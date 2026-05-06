import type { MockRole } from '$lib/mock/session';

export type DashboardNavItem = {
  label: string;
  href: string;
  description?: string;
};

export const dashboardNavigation: Record<MockRole, DashboardNavItem[]> = {
  USER: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      description: 'Ringkasan akun customer'
    },
    {
      label: 'Pesanan Saya',
      href: '/dashboard/orders',
      description: 'Riwayat dan status pesanan'
    },
    {
      label: 'Alamat Saya',
      href: '/dashboard/addresses',
      description: 'Manajemen lokasi pengiriman'
    },
    {
      label: 'Profil Saya',
      href: '/dashboard/profile',
      description: 'Pengaturan informasi akun'
    },
    {
      label: 'Katalog',
      href: '/katalog',
      description: 'Lihat menu catering'
    }
  ],

  CUSTOMER_SERVICE: [
    {
      label: 'CS Overview',
      href: '/dashboard/cs',
      description: 'Ringkasan operasional CS'
    },
    {
      label: 'Pesanan Masuk',
      href: '/dashboard/cs/orders',
      description: 'Monitoring pesanan customer'
    },
    {
      label: 'Kelola Menu',
      href: '/dashboard/cs/menu',
      description: 'Posting dan update menu harian'
    },
    {
      label: 'Kelola Paket',
      href: '/dashboard/cs/packages',
      description: 'Kelola paket catering dan kategori layanan'
    },
    {
      label: 'Data Customer',
      href: '/dashboard/cs/customers',
      description: 'Kelola data pelanggan dan instansi'
    }
  ],

  ADMIN: [
    {
      label: 'Admin Overview',
      href: '/dashboard/admin',
      description: 'Ringkasan bisnis dan kontrol operasional'
    },
    {
      label: 'Pesanan',
      href: '/dashboard/admin/orders',
      description: 'Monitoring dan kontrol seluruh pesanan'
    },
    {
      label: 'Menu',
      href: '/dashboard/admin/menu',
      description: 'Kelola master menu dan status publik'
    },
    {
      label: 'Paket',
      href: '/dashboard/admin/packages',
      description: 'Kelola master paket catering'
    },
    {
      label: 'Customer',
      href: '/dashboard/admin/customers',
      description: 'Kelola customer dan approval akun'
    },
    {
      label: 'Users & Role',
      href: '/dashboard/admin/users',
      description: 'Kelola akun internal dan role pengguna'
    },
    {
      label: 'Laporan',
      href: '/dashboard/admin/reports',
      description: 'Rekap penjualan dan performa bisnis'
    },
    {
      label: 'Audit Log',
      href: '/dashboard/admin/audit',
      description: 'Riwayat perubahan dan aktivitas sistem'
    },
    {
      label: 'Settings',
      href: '/dashboard/admin/settings',
      description: 'Pengaturan sistem dan website'
    }
  ]
};
