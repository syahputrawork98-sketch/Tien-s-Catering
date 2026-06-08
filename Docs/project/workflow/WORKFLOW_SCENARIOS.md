# Workflow Scenarios — WK

## Fungsi Dokumen
Jelaskan bahwa dokumen ini berisi skenario cara memakai WK dalam berbagai kondisi project. Tujuannya agar Roomchat 00 tidak memaksakan satu alur yang kaku untuk semua project.

## Prinsip Utama
- Pilih skenario berdasarkan kondisi project.
- Roomchat 00 tetap manager utama.
- Gemini Anti-Gravity tetap eksekutor.
- User tetap owner dan satu-satunya pihak yang commit/push.
- Skenario boleh digabung jika dibutuhkan, tetapi scope batch harus tetap kecil.
- Jika skenario menyentuh area sensitif, gunakan review atau konfirmasi user.

## 1. Docs-First Workflow
- Cocok untuk project besar, project klien, multi role, admin dashboard, fullstack.
- Alur:
  1. Tentukan project type.
  2. Adaptasi README.md.
  3. Adaptasi FEATURES.md.
  4. Buat feature tracker awal.
  5. Baru masuk client/server/database.
- Risiko:
  - lebih lambat, tetapi aman.

## 2. Client-First Workflow
- Cocok untuk landing page, company profile, portfolio, travel website, katalog, project yang butuh visual cepat.
- Alur:
  1. Tentukan project type minimal.
  2. Tentukan role minimal.
  3. Tentukan route/page awal.
  4. Setup client.
  5. Buat UI awal.
  6. Catat Documentation Debt jika docs belum lengkap.
  7. Lakukan FXX-CP setelah UI stabil.
- Peringatan:
  - jangan membuat UI multi role tanpa role map.
  - jangan membuat dashboard tanpa tahu siapa user-nya.
  - jangan membuat banyak page tanpa route plan.

## 3. Server / Backend-First Workflow
- Cocok untuk API service, CMS, booking system, dashboard, project data dinamis.
- Alur:
  1. Tentukan API contract draft.
  2. Tentukan role/access minimal.
  3. Setup server.
  4. Buat endpoint awal.
  5. Validasi endpoint.
  6. Baru integrasi frontend.
- Peringatan:
  - jangan membuat endpoint tanpa API contract.
  - jangan membuat auth tanpa role policy.
  - jangan membuat backend terlalu jauh sebelum kebutuhan frontend jelas.

## 4. Database-First Workflow
- Cocok untuk CMS, booking/order, multi user, inventory, project data kompleks.
- Alur:
  1. Tentukan entity utama.
  2. Tentukan ownership data.
  3. Tentukan role access.
  4. Buat database draft.
  5. Review sebelum schema final.
  6. Baru migration/implementation.
- Peringatan:
  - jangan finalkan schema sebelum role dan ownership jelas.
  - jangan migration terlalu cepat jika struktur belum stabil.

## 5. Fast Prototype Workflow
- Cocok untuk demo awal, eksplorasi desain, ide klien, validasi tampilan.
- Alur:
  1. Buat scope kecil.
  2. Boleh mulai dari client.
  3. Boleh pakai placeholder/mock data.
  4. Jangan langsung backend/database kecuali diminta.
  5. Catat sebagai Prototype / Partial.
  6. Setelah visual cocok, baru rapikan docs dan backend.
- Peringatan:
  - jangan klaim Completed jika masih prototype.
  - jangan bawa mock data ke production tanpa review.

## 6. Safe Production Workflow
- Cocok untuk project klien, project publik, login/admin, database, deployment production.
- Alur:
  1. Docs-first.
  2. Role map.
  3. API contract.
  4. Database ownership.
  5. Frontend/backend implementation.
  6. Roomchat 01 review untuk area sensitif.
  7. Build/test.
  8. Deployment checklist.
- Peringatan:
  - jangan lewati review untuk auth, database, deployment, atau env.

## 7. Documentation Debt / Docs-Later Workflow
- Digunakan saat kerja teknis perlu jalan dulu, tetapi docs belum lengkap.
- Contoh Documentation Debt:
  - client route berubah, docs/frontend belum update.
  - endpoint backend dibuat, docs/backend belum update.
  - schema berubah, docs/database belum update.
  - README/FEATURES belum disesuaikan.
- Aturan:
  - Documentation Debt harus dicatat.
  - Jangan biarkan menumpuk terlalu lama.
  - Selesaikan lewat FXX-CP Documentation Checkpoint.

## 8. Review-Light Workflow
- Cocok untuk typo, naming, docs ringan, placeholder, update table kecil.
- Alur (Post-batch / review-light dapat memakai ROOM_00_ACCEPTANCE_TEMPLATE.md):
  1. Roomchat 00 buat batch.
  2. Gemini eksekusi.
  3. Roomchat 00 accept.
  4. Lanjut batch berikutnya jika aman.
- Peringatan:
  - tetap cek scope dan git status.

## 9. Review-Heavy Workflow
- Cocok untuk auth, role permission, database schema, deployment, refactor besar, frontend-backend integration.
- Alur (Post-batch / review-heavy dapat memakai ROOM_00_ACCEPTANCE_TEMPLATE.md):
  1. Roomchat 00 buat batch.
  2. Gemini eksekusi.
  3. Roomchat 00 cek laporan.
  4. Roomchat 01 audit.
  5. User validasi.
  6. Baru lanjut.
- Peringatan:
  - jangan memakai review-heavy untuk pekerjaan kecil agar workflow tidak lambat.

## 10. Template-to-Project Adaptation Workflow
- Digunakan saat WK di-clone atau dijadikan dasar project nyata. Workflow ini menggunakan `PROJECT_STARTER_CHECKLIST.md`.
- Alur:
  1. Clone WK ke repo project baru.
  2. Ganti/adaptasi nama project.
  3. Adaptasi README.md.
  4. Adaptasi FEATURES.md.
  5. Tentukan project type.
  6. Tentukan apakah client/server/database dipakai.
  7. Buat F01 untuk project nyata.
  8. Jangan membawa F00 sebagai fitur aplikasi.
- Peringatan:
  - README.md project turunan tidak boleh tetap hanya menjelaskan WK.
  - FEATURES.md project turunan harus menjadi fitur website/aplikasi nyata.
  - Jangan campur F00 workflow foundation dengan fitur aplikasi.

## 11. Existing Project Documentation Adoption Workflow
- Digunakan saat WK diterapkan pada project yang sudah punya client/server matang tetapi docs berantakan. Workflow ini menggunakan `EXISTING_PROJECT_ADOPTION.md`.
- Jangan pakai Project Starter Checklist biasa tanpa audit existing.
- Gunakan progressive adoption levels dari EXISTING_PROJECT_ADOPTION.md.
- Jangan langsung memasukkan seluruh struktur WK.
- Untuk project existing, mulai dari Level 0 Read-only Pre-Scan atau Level 1 Minimal Control Layer.
- Jika user meminta “rapikan semua”, pecah menjadi batch bertahap.
- Alur detail ada di panduan existing adoption.

## 12. Specialist Analysis Room Workflow
- Digunakan saat user butuh analisa mendalam tanpa membebani Roomchat 00. Workflow ini menggunakan `SPECIALIST_ANALYSIS_TEMPLATE.md`.
- Roomchat spesialis bisa dibuat di ChatGPT.com untuk topik tertentu, misalnya:
  - UX / UI
  - Frontend
  - Backend
  - Database
  - Auth / Role / Permission
  - Deployment
  - Content / Copywriting
  - Business / Client Requirement
  - Feature Planning
- Alur:
  1. User membuka roomchat spesialis untuk membahas topik tertentu.
  2. Roomchat spesialis melakukan analisa mendalam.
  3. Roomchat spesialis membuat ringkasan final.
  4. User mengirim ringkasan final ke Roomchat 00.
  5. Roomchat 00 membaca, menilai, menyaring scope, dan menentukan apakah hasil analisa:
     - Accepted as direction
     - Needs clarification
     - Needs simplification
     - Too broad, must be split
     - Needs Roomchat 01 Review
     - Ready for Gemini instruction
  6. Roomchat 00 membuat instruksi final untuk Gemini jika sudah siap.
- Aturan:
  - Roomchat spesialis tidak boleh memberi instruksi final langsung ke Gemini.
  - Roomchat spesialis tidak boleh menentukan batch final.
  - Roomchat spesialis tidak boleh mengubah status project.
  - Roomchat spesialis tidak otomatis menjadi dokumen repo.
  - Hasil spesialis hanya menjadi bahan keputusan Roomchat 00.
- Format ringkasan spesialis:
  Specialist Analysis Summary
  Topic:
  Purpose:
  Context:
  Recommendation:
  Options Considered:
  Risk Notes:
  Suggested Scope:
  Suggested Next Batch:
  Not Recommended:
  Decision Needed from Roomchat 00:

## Penutup
Roomchat 00 harus memilih skenario berdasarkan kondisi nyata, bukan memaksa semua project mengikuti satu alur.
