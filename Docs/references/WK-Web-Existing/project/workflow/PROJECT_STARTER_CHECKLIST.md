# Project Starter Checklist — WK

Fungsi:
Dokumen ini digunakan saat WK dipakai sebagai template untuk project nyata atau project turunan.

Isi checklist minimal:

* Mode penggunaan
  * [x] Existing project / project sudah berjalan
Untuk existing project:
  * [ ] Adoption level sudah dipilih
  * [ ] Level 0 read-only pre-scan sudah dilakukan jika project belum dipahami
  * [ ] Tidak membuat banyak file WK sekaligus
  * [ ] Tidak menimpa README lama sebelum mapping
  * [ ] Tidak membuat folder client/server baru jika project existing sudah punya struktur sendiri
  * [ ] Tidak membuat banyak feature files sebelum inventory disetujui
  * [ ] Batch awal maksimal 1–3 file jika bukan read-only
  * [ ] Kode/config/dependency/env/deployment tidak disentuh pada adoption awal
  * [ ] Jalankan Existing Project Adoption terlebih dahulu
  * [ ] Jangan ubah client/server sebelum audit
  * [ ] Buat Existing Project Audit Summary
  * [ ] Buat Feature Inventory berdasarkan fitur nyata
  * [ ] Gunakan status Existing / Needs Review jika belum divalidasi

* Project identity
  * [ ] Nama project sudah ditentukan
  * [ ] Nama repository sudah sesuai
  * [ ] Deskripsi project sudah jelas
  * [ ] Tujuan project sudah jelas
  * [ ] Target user sudah jelas

* Template adaptation
  * [ ] README.md sudah disesuaikan dengan project nyata
  * [ ] FEATURES.md sudah disesuaikan menjadi fitur website/aplikasi nyata
  * [ ] Nama WK tidak tertinggal sebagai nama project nyata kecuali sebagai referensi template
  * [ ] F00 tetap dipahami sebagai workflow foundation, bukan fitur aplikasi

* Project type
  * [ ] Static / Landing Page
  * [ ] Frontend-only Dynamic Website
  * [ ] Fullstack Single Role
  * [ ] Fullstack Multi Role
  * [ ] Fullstack Multi Role + Admin CMS

* Role mode
  * [ ] Single role
  * [ ] Multi role
  * [ ] Role belum diperlukan

* Area usage
  * [ ] client/ akan digunakan
  * [ ] server/ akan digunakan
  * [ ] database akan digunakan
  * [ ] deployment akan disiapkan
  * [ ] docs-only untuk tahap awal

* Workflow scenario
  * [ ] Docs-first
  * [ ] Client-first
  * [ ] Backend-first
  * [ ] Database-first
  * [ ] Fast prototype
  * [ ] Safe production
  * [ ] Documentation debt / docs-later
  * [ ] Review-light
  * [ ] Review-heavy
  * [ ] Template-to-project adaptation
  * [ ] Specialist analysis room

* First feature batch
  * [ ] F01 sudah didefinisikan
  * [ ] F01 feature file siap dibuat
  * [ ] CURRENT_STATUS.md siap disesuaikan
  * [ ] FEATURE_HISTORY.md siap disesuaikan

* Safety check
  * [ ] Tidak ada credential/API key/password/.env yang masuk repo
  * [ ] Tidak ada kode dibuat tanpa batch gate
  * [ ] Tidak ada dependency diinstall tanpa konfirmasi user
  * [ ] Tidak ada delete/rename tanpa instruksi eksplisit

* Discovery-First Documentation Checkpoints
  * [ ] AI telah membaca aplikasi yang sudah ada sebelum mengubah area docs.
  * [ ] Fitur ditemukan dan dicatat di `FEATURE_HISTORY.md` terlebih dahulu.
  * [ ] Relasi Frontend/Backend/Database dicatat sebagai status (Found, Needs Review, Unknown, dll) di file `FXX.md`.
  * [ ] Dokumentasi area (`docs/frontend`, `docs/backend`, dll) memetakan relasi teknis dari aplikasi lama, bukan memaksakan arsitektur baru.
  * [ ] Technical fix HANYA dimulai setelah status fitur dan risiko jelas.
