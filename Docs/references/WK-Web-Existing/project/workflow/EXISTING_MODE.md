# Existing Mode — WK

Dokumen ini menjelaskan logika kerja WK untuk project yang sudah memiliki aplikasi atau *codebase* berjalan. Inti dari mode ini adalah **Discovery-First Documentation** (yang berpusat pada penemuan fitur).

*(Catatan: Saat template ini diterapkan ke project asli, nama "WK-Web-Existing" pada repositori harus disesuaikan menjadi nama project asli Anda).*

## 1. Discovery-First Documentation

WK-Web-Existing adalah template untuk mengadopsi project web yang aplikasinya sudah ada.
Di Existing, dokumentasi area mencatat apa yang ditemukan dari aplikasi lama. Frontend/backend/database docs tidak boleh dipakai untuk memaksa struktur baru, tetapi untuk memetakan relasi teknis dari fitur yang sudah ditemukan.

**Pola:**
`temukan` → `catat` → `petakan` → `update status` → `baru perbaiki`

### Alur Dokumentasi Existing
F00 — Existing Project Zero Point
↓
Read-only scan
↓
docs/development mencatat cara run awal
↓
Feature discovery
↓
FEATURE_HISTORY.md diisi daftar fitur
↓
docs/history/features/F01-FXX dibuat
↓
docs/frontend mencatat relasi fitur ke UI
↓
docs/backend mencatat relasi fitur ke API/logic
↓
docs/database mencatat relasi fitur ke data/schema
↓
CURRENT_STATUS.md mencatat checkpoint terakhir
↓
Technical fix/development baru boleh dimulai

### Prinsip Discovery-First
- Existing tidak boleh dianggap project kosong.
- AI harus membaca aplikasi yang sudah ada terlebih dahulu.
- Jangan langsung *refactor*.
- Jangan langsung membuat ulang frontend/backend/database.
- Jangan membuat client/server baru jika project sudah memakai struktur lain seperti `apps/web`, `apps/api`, `src`, `frontend`, `backend`, atau struktur *custom*.
- Fitur ditemukan dulu sebelum frontend/backend/database dicatat detail.
- `FEATURE_HISTORY.md` menjadi index fitur yang ditemukan.
- `docs/history/features/FXX` menjadi pusat detail tiap fitur.
- `docs/frontend` mencatat peta frontend berdasarkan fitur.
- `docs/backend` mencatat peta backend/API berdasarkan fitur.
- `docs/database` mencatat peta database/schema berdasarkan fitur.
- `docs/development` mencatat cara menjalankan project existing, bukan tanda bahwa *technical fix* boleh langsung dilakukan.
- `CURRENT_STATUS.md` mencatat posisi audit terakhir dan *next step*.

## 2. Simulasi Ringkas Existing

Misalnya project existing punya struktur:
- `apps/web/`
- `apps/api/`
- `prisma/`
- `package.json`

Setelah *read-only scan*, AI menemukan:
- F01 — Landing Page
- F02 — Tour Package Page
- F03 — Booking Form
- F04 — Admin Login
- F05 — Admin Dashboard

`FEATURE_HISTORY.md` mencatat fitur tersebut sebagai index.

**Contoh file: `docs/history/features/F03_BOOKING_FORM.md`**
Isi relasi:
- Frontend Relation: `apps/web/src/components/BookingForm.tsx` (Found)
- Backend Relation: `apps/api/src/routes/booking.ts` (Found)
- Database Relation: Unknown / Needs Review
- Development Notes: belum diuji di local
- Known Gaps: belum jelas apakah booking tersimpan ke database
- Next Step: audit backend booking dan database schema

## 3. Status Relasi Area (Frontend/Backend/Database)

Untuk WK-Web-Existing, gunakan status relasi teknis berikut dalam dokumentasi relasi area:
- **Found** — File/kode teknis ditemukan dan jelas.
- **Needs Review** — Kemungkinan ada file/tabel terkait, tetapi belum diverifikasi.
- **Unknown** — Belum diketahui apakah fitur punya API/backend/frontend/tabel.
- **Not Required** — Fitur tidak membutuhkan area tersebut (misal, static page tidak butuh database).
- **Partial** — Sebagian ditemukan, sebagian belum.
- **Blocked** — Tidak bisa dipetakan karena ada error atau halangan lain.

*(Jangan gunakan status `Completed` untuk fitur existing sebelum benar-benar divalidasi dan diuji).*

## 4. Syarat Development Baru

*Technical fix* atau *development* baru baru boleh dilakukan SETELAH:
- F00 sudah ada.
- `FEATURE_HISTORY.md` sudah berisi daftar fitur.
- File detail fitur sudah dibuat untuk fitur utama.
- Relasi frontend/backend/database sudah mulai dipetakan.
- `CURRENT_STATUS.md` menunjukkan checkpoint terakhir.
- User menyetujui batch perbaikan.

## 5. Model Execution Policy

Default model untuk eksekusi AI (Gemini) di lingkungan ini adalah:
- **Gemini 3.1 Pro low**
- **Gemini 3.1 Pro high**

**Aturan Pemakaian**:
- **Gemini 3.1 Pro low**: Digunakan untuk batch ringan, dokumentasi kecil, review sederhana, update status, dan perubahan *low-risk*.
- **Gemini 3.1 Pro high**: Digunakan untuk audit lebih dalam, analisis fitur, mapping frontend/backend/database, *refactor planning*, atau batch yang membutuhkan reasoning lebih kuat.

Roomchat 00 harus memahami kapan menggunakan model yang tepat dan merekomendasikannya kepada User. Namun, keputusan akhir model tetap mengikuti User.

*(Model alternatif opsional jika User meminta percepatan: Claude Sonnet 4.6 thinking, Claude Opus 4.6 thinking, GPTOS 120B medium, Gemini 3.5 Flash low/medium/high).*
