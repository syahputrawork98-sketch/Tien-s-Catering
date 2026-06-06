# Project Control

Folder ini adalah **satu-satunya pusat kontrol resmi** untuk project TC / Tien’s Catering.
Folder lama `Docs/project/` sudah tidak dipakai dan telah dihapus.

## Peran Room
- **Room 00 (Team Lead / Pengambil Keputusan)**: Menjaga arah, scope, dan membuat instruksi final.
- **Room 01 (Analis Repository / Dokumen)**: Melakukan analisa mendalam terhadap repo dan dokumen tanpa mengubah file.
- **Gemini 3 Flash (Executor)**: Menjalankan instruksi murni satu kali per instruksi.
- **User / CEO (Pemilik Keputusan Akhir)**: Menentukan arah besar, melakukan commit, dan push secara manual.

GitHub adalah source of truth setelah user melakukan commit & push.

## Prinsip Kerja

- Hasil kerja baru dianggap resmi setelah commit & push oleh User.
- Jika belum commit & push, maka belum menjadi kondisi resmi project.
- Gemini 3 Flash dilarang melakukan loop eksekusi (check-fix-check berulang).

## Alur Kerja

1. **User** memberi arah ke **Room 00**.
2. **Room 00** menentukan scope dan keputusan.
3. **Room 00** meminta analisa ke **Room 01** jika perlu.
4. **Room 01** membaca repository dan memberi laporan analisa.
5. **Room 00** membuat instruksi final untuk **Gemini 3 Flash**.
6. **Gemini 3 Flash** eksekusi satu kali di Antigravity.
7. **Gemini** melaporkan hasil ke **User**.
8. **User** kirim laporan Gemini ke **Room 00**.
9. **User** melakukan commit & push jika hasil diterima.
10. **Room 00 / Room 01** membaca kondisi terbaru dari GitHub.

## Dokumentasi Kontrol
- [Executor Rules](./executor-rules.md)
- [Instruction Template](./instruction-template.md)
- [Scope Guard](./scope-guard.md)
- [Workflow Room](./workflow-room.md)
- [Current Status](./current-status.md)
