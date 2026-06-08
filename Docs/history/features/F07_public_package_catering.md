# F07 — Public Package Catering

## Feature Type
Public

## Discovery Source
- **Frontend Page**: [apps/src/routes/paket-catering/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/paket-catering/)
- **Components**: [apps/src/lib/components/PackageDetailModal.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/PackageDetailModal.svelte), [apps/src/lib/components/PublicNavbar.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/PublicNavbar.svelte)
- **API Endpoint**: [apps/src/routes/api/packages/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/api/packages/)
- **Service & Repository**: [apps/src/lib/server/services/packageService.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/services/packageService.ts), [apps/src/lib/server/repositories/packageRepository.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/repositories/packageRepository.ts)
- **Database Tables**: `packages` in [apps/src/lib/server/db/schema.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/db/schema.ts)
- **Mock Data**: [apps/src/lib/mock/catalog.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/mock/catalog.ts), [apps/src/lib/server/dev-data/packages.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/dev-data/packages.ts)

## Current Status
Found / Needs Functional Validation

## What Exists
1. **Public Packages Page (`/paket-catering`)**:
   - Rute halaman publik yang menyajikan daftar paket katering dalam tata letak grid.
   - Merender detail info: nama paket, deskripsi ringkas, tag kecocokan acara (`suitableFor`), menu utama (`features`), harga dasar (`basePrice`), kategori, dan minimum kuantitas porsi (`minPax`).
   - Tombol "Detail Paket" pada setiap kartu paket memicu pembukaan popup modal detail.
2. **Package Detail Modal & Request Form (`PackageDetailModal.svelte`)**:
   - Modal menampilkan informasi rincian paket secara detail beserta formulir pengajuan request paket (F08).
   - Form mengikat input Nama Pemesan, WhatsApp, Tanggal Acara, Jumlah Pax, Lokasi, dan Catatan Kebutuhan, yang dikirim ke endpoint POST `/api/package-requests` setelah lolos validasi.
3. **Packages API Endpoint (`/api/packages`)**:
   - Menyediakan handler GET (publik) untuk memuat data paket aktif dari database.
   - Menyediakan handler POST (admin/CS) untuk pembuatan data paket baru.
4. **SQLite Persistence & Seeding**:
   - Tabel `packages` menyimpan properti detail paket katering. Kolom array didefinisikan sebagai string JSON (`images_json`, `package_items_json`, `features_json`, `suitable_for_json`).
   - Melakukan seeding benih data otomatis menggunakan `devPackageSeeds` saat repositori diakses pertama kali jika tabel dalam keadaan kosong.

## Technical Relations & Flow Map

### 1. Packages Data Flow (Read)
$$\text{SQLite DB (packages)} \longrightarrow \text{packageRepository.ts (listPackageRecords)} \longrightarrow \text{packageService.ts} \longrightarrow \text{GET /api/packages} \longrightarrow \text{paket-catering/+page.ts} \longrightarrow \text{+page.svelte} \longrightarrow \text{PackageDetailModal.svelte}$$

### 2. Integration with Package Request (Write F08)
$$\text{PackageDetailModal.svelte (Form Submit)} \longrightarrow \text{POST /api/package-requests} \longrightarrow \text{Database SQLite (package\_requests table)}$$

## UI Behaviors Discovered
- **Automatic Hiding**: Hanya paket katering dengan status aktif (`isActive` = true, `status !== 'inactive'`) yang ditampilkan di antarmuka publik.
- **Dynamic Min Pax Validation**: Jumlah pax masukan divalidasi reaktif terhadap batas minimum pax paket (`minPax`).

## Known Gaps (Needs Audit / Validation)
- **No Direct Slug Linking**: Tidak ada rute detail individual berbasis URL slug seperti `/paket-catering/[slug]`. Semua rincian diakses lewat popup modal, menyulitkan pembagian tautan detail paket secara langsung.
- **Statically Hardcoded Features**: Tampilan detail fasilitas paket di modal ("Menu Utama Pilihan", "Layanan Pramusaji", "Peralatan Lengkap") merupakan konten statis hardcoded, tidak dinonaktifkan/diubah berdasarkan data string array di database.
- **Unvalidated Backend Pax Limits**: Ketiadaan validasi ulang ketersediaan batas minimum pax di backend ketika request dikirim, murni bersandar pada input validasi client-side.
- **Missing Grid Empty State**: Tidak ada penanganan visual/banner empty state khusus pada halaman `/paket-catering` jika list paket kosong atau tidak berhasil dimuat dari API.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
