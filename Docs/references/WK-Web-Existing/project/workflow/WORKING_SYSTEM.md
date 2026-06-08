# Working System

Sistem kerja WK dirancang untuk keamanan, konsistensi, dan keteraturan.

## Prinsip Utama
1. **GitHub sebagai Source of Truth**.
2. **Tidak ada AI yang boleh commit/push**.
3. **Review sebelum dan sesudah eksekusi**.

## Peran
- **User**: Pemilik project. Menyetujui rencana, memindahkan instruksi antar room, melakukan commit dan push.
- **Roomchat 00**: Manager Utama (ChatGPT). Merencanakan fitur, membuat instruksi untuk Gemini.
- **Roomchat 01**: Reviewer (ChatGPT). Mengaudit rencana (Batch Gate) dan hasil eksekusi.
- **Gemini Anti-Gravity**: Eksekutor. Menulis kode/dokumentasi di workspace lokal Anti-Gravity IDE.
- **Anti-Gravity IDE**: Workspace nyata tempat eksekusi dan validasi dilakukan.

## Pre-Batch Mode vs Batch Execution
- **Pre-Batch Mode**: Fase perencanaan di Room 00 dan audit di Room 01. Belum ada kode yang ditulis.
- **Batch Execution**: Fase pengerjaan nyata di Anti-Gravity IDE oleh Gemini.

## Ukuran Batch
- **Small Batch**: 1–3 file, satu area, risiko rendah.
- **Medium Batch**: 4–8 file, satu sampai dua area, risiko sedang.
- **Large Batch**: Lebih dari 8 file. Wajib dipecah menjadi batch yang lebih kecil.

## Scope Area
Pembagian area kerja dalam project:
- `docs`
- `frontend`
- `backend`
- `database`
- `deployment`
- `content`
- `design`

## Batch Gate
Mekanisme validasi (checkpoint) sebelum instruksi dari Room 00 dieksekusi oleh Gemini. Harus disetujui (APPROVED) oleh Room 01 (atau User).

## Feature Batch Naming Policy
- `F00` = workflow/setup awal
- `F01` = project foundation
- `F02` = frontend core
- `F03` = backend/API
- `F04` = database
- `F05` = deployment/domain
- `FXX-CP` = checkpoint dokumentasi

## Definition of Done
Setiap batch dianggap selesai jika:
1. Kriteria penerimaan dari instruksi terpenuhi.
2. Tidak ada error/bug yang diketahui.
3. Dokumentasi (terutama `CURRENT_STATUS.md` dan feature file) sudah diperbarui.
4. Laporan eksekutor sudah diserahkan.
5. User telah me-review, commit, dan push ke repository.

## Adaptasi Template dan Kedalaman Dokumentasi

WK adalah template yang harus disesuaikan dengan kebutuhan project turunan. File seperti `README.md` dan `FEATURES.md` di project turunan wajib diubah untuk mencerminkan project nyata.

### Aturan Adaptasi README.md
README project turunan sebaiknya berisi:
- Nama project dan deskripsi singkat
- Kenapa project dibuat & target pengguna
- Fitur utama & teknologi yang digunakan
- Struktur folder & cara menjalankan local development
- Status project & catatan deployment jika ada

### Aturan Adaptasi FEATURES.md
FEATURES project turunan sebaiknya berisi daftar fitur nyata:
- Fitur public user, customer/login, admin
- Fitur backend/API & database
- Fitur deployment
- Status fitur: Planned, In Progress, Completed, Partial, Blocked, HOLD

### Jenis Project Turunan (Project Type)
1. **Static / Landing Page**: Cocok untuk web tanpa backend.
2. **Frontend-only Dynamic Website**: Cocok untuk web dinamis dengan API eksternal/BaaS.
3. **Fullstack Single Role**: Cocok untuk aplikasi dengan satu jenis user (misal CMS admin saja atau user saja).
4. **Fullstack Multi Role**: Cocok untuk aplikasi dengan beberapa jenis hak akses.
5. **Fullstack Multi Role + Admin CMS**: Cocok untuk sistem kompleks dengan manajemen penuh.

### Kedalaman Dokumentasi (Documentation Depth)
Kedalaman dokumentasi mengikuti kompleksitas project:
- **Static / Landing Page**: README wajib disesuaikan. FEATURES berisi fitur section/halaman. Frontend docs ringan. Backend/Database docs tidak wajib.
- **Frontend-only Dynamic**: README disesuaikan. FEATURES berisi fitur web. Frontend docs wajib. Backend/Database docs hanya jika ada integrasi eksternal.
- **Fullstack Single Role**: README disesuaikan. FEATURES berisi fitur front & back. Frontend & Backend docs wajib. Database docs wajib jika ada. Role matrix tidak wajib (cukup role utama).
- **Fullstack Multi Role**: README disesuaikan. FEATURES berisi fitur per role. Semua docs wajib. Role matrix, API contract, dan database ownership wajib.
- **Fullstack Multi Role + Admin CMS**: Semua dokumentasi wajib. Role & permission matrix, API contract, database ownership, dan admin feature tracker wajib. Checkpoint dokumentasi lebih sering.

### Documentation Debt / Docs Later
Kerja teknis boleh mendahului dokumentasi detail, tetapi harus dicatat sebagai **Documentation Debt**.
Gunakan Documentation Debt ketika:
- Client sudah berubah tapi docs/frontend belum diupdate.
- Server/backend sudah berubah tapi docs/backend belum diupdate.
- Database/schema sudah berubah tapi docs/database belum diupdate.
- README/FEATURES belum disesuaikan setelah project berubah.

Documentation Debt wajib diselesaikan melalui eksekusi **FXX-CP — Documentation Checkpoint**.

## History Layer Separation

- `docs/project/` adalah workflow/control layer.
- `docs/history/` adalah persistent project memory layer.
- `CURRENT_STATUS.md`, `FEATURE_HISTORY.md`, dan folder `features/` harus berada di `docs/history/`.
- `docs/project/` boleh dianggap removable/internal workflow layer pada project turunan.
- `docs/history/` sebaiknya tetap disimpan karena berisi status project, feature tracker, dan riwayat pengerjaan.
- Jangan menyimpan history utama di `docs/project/history/` lagi.

### Internal Workflow Layer
`docs/project/` digunakan untuk:
- onboarding AI
- prompt Roomchat
- workflow system
- batch templates
- specialist room templates
- existing adoption rules
- scenario playbook

### Persistent History Layer
`docs/history/` digunakan untuk:
- CURRENT_STATUS.md
- FEATURE_HISTORY.md
- feature files
- project status
- feature roadmap
- decision history
- checkpoint history

## Public / Client-Safe History Mode

Jika `docs/history/` akan tetap disimpan di repo publik atau repo client, gunakan gaya bahasa netral.

Hindari kalimat seperti:
- Gemini mengerjakan...
- ChatGPT Roomchat 00 memberi instruksi...
- AI melakukan...
- Prompt ini dibuat oleh...

Gunakan bahasa netral seperti:
- Batch diselesaikan.
- Scope telah divalidasi.
- Status fitur diperbarui.
- Dokumentasi telah disinkronkan.
- Siap lanjut ke batch berikutnya.

Aturan tambahan:
- Internal AI details boleh tetap berada di `docs/project/`.
- `docs/history/` sebaiknya ditulis agar tetap aman dibaca tanpa terlalu menonjolkan proses AI.
- Jika user ingin membersihkan project turunan, `docs/project/` dapat dilepas, tetapi `docs/history/` tetap dapat dipertahankan.

## Feature File Standard Format

Setiap file di `docs/history/features/` wajib memakai struktur:
* Feature Summary
* Status
* Story
* Current State
* Sub-Batch Roadmap
* HOLD / Blocked Notes
* Next Step
* Validation Checklist
* Notes

Aturan penamaan dan pemisahan fitur:
* `F00` dipakai khusus untuk workflow foundation.
* Jangan mencampur `F00` dengan fitur aplikasi nyata.
* Fitur aplikasi/project turunan sebaiknya dimulai dari `F01` atau sistem penamaan yang disepakati.
* `FEATURE_HISTORY.md` hanya index.
* `CURRENT_STATUS.md` hanya dashboard ringkas.
* Detail panjang sub-batch disimpan di file feature masing-masing.

## Post-Batch Acceptance Flow
- Gemini Anti-Gravity selesai mengerjakan batch dan mengirim laporan.
- User mengirim laporan hasil batch ke Roomchat 00.
- Roomchat 00 mengecek laporan berdasarkan scope, file yang berubah, status akhir, validasi, dan risiko.
- Roomchat 00 menentukan salah satu acceptance result:
  - **Accepted**: Lanjut jika next step jelas dan tidak membutuhkan keputusan baru dari user.
  - **Accepted with Notes**: Lanjut, tetapi catatan harus masuk batch berikutnya atau checkpoint.
  - **Needs Fix**: Buat patch kecil seperti FXXA.1.
  - **Needs Roomchat 01 Review**: Roomchat 01 hanya menganalisis dan memberi rekomendasi.
  - **Blocked / HOLD / Rejected**: Jangan lanjut sebelum masalah jelas.

## Review Policy
- Roomchat 01 review tidak wajib untuk setiap batch.
- Roomchat 01 dipanggil hanya jika Roomchat 00 atau user merasa perlu.
- Review bersifat risk-based, bukan ritual setiap batch.

### Kapan tidak perlu Roomchat 01
- Batch dokumentasi ringan.
- Small batch 1 sampai 3 file.
- Tidak menyentuh client/server/database.
- Tidak membuat dependency/config.
- Tidak mengubah arsitektur.
- Tidak ada security/auth/deployment risk.
- Laporan eksekutor jelas.
- User bisa cek manual dengan mudah.

### Kapan perlu Roomchat 01
- Batch medium/large dengan banyak file.
- Menyentuh lebih dari satu area besar.
- Frontend-backend integration.
- Backend-database integration.
- Auth, login, role, permission.
- Deployment, env, domain.
- Refactor besar.
- Perubahan struktur folder besar.
- Status Partial/Blocked.
- Ada kejanggalan dari laporan Gemini.
- User atau Roomchat 00 ragu.

### Kapan User Harus Konfirmasi Dulu
- Sebelum membuat kode pertama kali.
- Sebelum install dependency.
- Sebelum setup framework.
- Sebelum membuat database schema/migration.
- Sebelum menyentuh auth/security.
- Sebelum deployment/domain/env.
- Sebelum delete/rename file/folder.
- Sebelum mengubah arah fitur utama.
- Sebelum memilih project type jika belum jelas.

### Kapan Roomchat 00 Boleh Menyiapkan Batch Berikutnya
- Batch sebelumnya Completed.
- Roomchat 00 memberi Accepted atau Accepted with Notes.
- Tidak ada blocker.
- Next step jelas.
- Batch berikutnya masih dalam scope yang sama.
- Tidak menyentuh area sensitif.
- Tidak membutuhkan keputusan baru dari user.

## Operational Templates
* `PROJECT_STARTER_CHECKLIST.md` digunakan saat WK mulai dipakai untuk project nyata.
* `ROOM_00_ACCEPTANCE_TEMPLATE.md` digunakan setelah Gemini selesai batch.
* `SPECIALIST_ANALYSIS_TEMPLATE.md` digunakan saat analisa dilakukan di roomchat spesialis.

## Referensi Skenario Workflow
- **Existing Project Mode**: Ikuti panduan di `docs/project/workflow/EXISTING_MODE.md`. Existing adoption harus dimulai dari audit/docs-only.

Untuk memilih cara kerja spesifik seperti docs-first, client-first, server-first, prototype, production-safe, atau specialist analysis room, gunakan `docs/project/workflow/WORKFLOW_SCENARIOS.md`.
WORKFLOW_SCENARIOS.md tidak menggantikan WORKING_SYSTEM.md, hanya menjadi playbook skenario.

## Safety Rules
- Jangan menyimpan credential/secret di repository (gunakan file `.env.example` sebagai panduan).
- Jangan men-generate kode ekstensif di luar scope instruksi.
- Eksekutor dilarang melakukan `git commit` dan `git push`.

## Model Execution Policy

Default model untuk eksekusi Gemini di lingkungan ini adalah:
- **Gemini 3.1 Pro low**
- **Gemini 3.1 Pro high**

**Aturan Pemakaian**:
- **Gemini 3.1 Pro low** digunakan untuk batch ringan, dokumentasi kecil, review sederhana, update status, dan perubahan *low-risk*.
- **Gemini 3.1 Pro high** digunakan untuk audit lebih dalam, analisis fitur, mapping frontend/backend/database, *refactor planning*, atau batch yang membutuhkan reasoning lebih kuat.

Roomchat 00 harus memahami:
- jika batch ringan dan cepat → rekomendasikan Gemini 3.1 Pro low;
- jika batch audit/analisis kompleks → rekomendasikan Gemini 3.1 Pro high;
- jika user ingin percepatan → Roomchat 00 boleh menyesuaikan rekomendasi model;
- keputusan akhir model tetap mengikuti user.

*Daftar model alternatif yang boleh disebut sebagai opsional (jika di-request eksplisit oleh User)*:
- Claude Sonnet 4.6 thinking
- Claude Opus 4.6 thinking
- GPTOS 120B medium
- Gemini 3.5 Flash low
- Gemini 3.5 Flash medium
- Gemini 3.5 Flash high

Namun, default WK-Web-Existing tetap **Gemini 3.1 Pro low/high**.

## Fungsi Dokumen Area (Discovery-First)

WK-Web-Existing menggunakan pendekatan **Discovery-First Documentation**. Area docs mencatat apa yang ditemukan dari aplikasi lama, bukan memaksakan struktur baru.

### 1. `CURRENT_STATUS.md`
Berfungsi sebagai dashboard posisi kerja terakhir. Menjawab:
- terakhir mengaudit sampai fitur apa?
- fitur mana yang sudah ditemukan?
- relasi frontend/backend/database mana yang sudah jelas?
- next audit apa?

### 2. `FEATURE_HISTORY.md`
Berfungsi sebagai index semua fitur yang ditemukan dari aplikasi lama. Bukan tempat detail panjang, melainkan mengarah ke `docs/history/features/FXX`.

### 3. `docs/history/features/FXX.md`
Pusat detail tiap fitur. Menjawab:
- fitur ini ditemukan di mana?
- frontend-nya ada di file mana?
- backend/API-nya ada di mana?
- database-nya pakai table/model apa?
- statusnya sudah jelas atau belum?
- apa yang perlu dicek lagi?

### 4. `docs/frontend/`
Mencatat area frontend. Menjawab:
- frontend aplikasi existing ada di mana?
- fitur F01-FXX terhubung ke file frontend mana?
- komponen mana yang mendukung fitur tertentu?
- mana yang sudah Found, Needs Review, Unknown, atau Not Required?

### 5. `docs/backend/`
Mencatat area backend/API. Menjawab:
- backend aplikasi existing ada di mana?
- API mana yang mendukung fitur F01-FXX?
- controller/service/middleware mana yang berhubungan?
- mana yang Found, Needs Review, Unknown, atau Not Required?

### 6. `docs/database/`
Mencatat area database/data model. Menjawab:
- database existing ada di mana?
- model/table apa yang mendukung fitur F01-FXX?
- relasi data sudah jelas atau belum?
- database boleh diubah atau belum?
- mana yang Found, Needs Review, Unknown, atau Not Required?

### 7. `docs/development/`
Mencatat cara menjalankan project dan kondisi teknis development. Menjawab:
- cara menjalankan project existing;
- package manager yang ditemukan;
- scripts yang tersedia;
- env yang ada/belum ada;
- masalah run local yang ditemukan.

*(Catatan: Development docs bukan berarti technical fix boleh langsung dilakukan. Ini hanya catatan cara menjalankan project. Technical fix baru boleh dilakukan setelah status fitur dan risiko jelas).*

## Area Documentation Structure
- Docs area adalah navigation map, bukan source-code duplicate.
- Struktur utama: overview + map + feature-specific detail.
- Folder: `docs/frontend`, `docs/backend`, `docs/database`, `docs/development`.
- Detail per fitur ada di subfolder `features/` jika diperlukan.
- Source code tetap sumber kebenaran teknis terakhir.
- Pada mode ini (Existing), menggunakan prinsip Discovery-First Documentation.
