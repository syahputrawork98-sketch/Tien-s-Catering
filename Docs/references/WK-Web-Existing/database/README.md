# Database Documentation

Fungsi folder `docs/database/` adalah sebagai peta teknis schema/data/model.
Bukan tempat menulis ulang seluruh schema.
Dokumentasi area tidak bertujuan menyalin ulang isi source code. Dokumentasi area hanya mencatat peta relasi fitur, lokasi file penting, status teknis, known gaps, dan next step. Source code tetap menjadi sumber kebenaran teknis terakhir.

Relasi fitur tetap berpusat di `docs/history/features/FXX`.
Database docs mencatat schema, table/model, relation, migration, seed, ownership, dan relasi data ke fitur.

Pada Existing (Discovery-First Documentation), database docs mencatat schema/model yang ditemukan dari aplikasi existing.

## Aturan Anti-Berantakan
1. README.md hanya menjelaskan fungsi folder dan aturan penulisan.
2. OVERVIEW.md hanya gambaran besar area.
3. FEATURE_*_MAP.md hanya relasi fitur ke area teknis.
4. MAP file harus berupa tabel/index singkat, bukan narasi panjang.
5. Detail panjang masuk ke subfolder features/.
6. File detail per fitur hanya dibuat jika fitur tersebut benar-benar punya relasi penting ke area itu.
7. Jangan membuat file kosong untuk semua fitur.
8. Jangan duplikasi isi docs/history/features/FXX ke frontend/backend/database.
9. docs/history/features/FXX tetap pusat cerita fitur.
10. docs/frontend, docs/backend, docs/database hanya peta teknis pendukung.
11. CURRENT_STATUS.md hanya checkpoint terakhir.
12. FEATURE_HISTORY.md hanya index fitur.
13. Jika catatan teknis belum jelas, tulis Unknown atau Needs Review, jangan mengarang.
14. Jika area tidak dibutuhkan fitur, tulis Not Required.
15. Source code tetap sumber kebenaran teknis terakhir.
