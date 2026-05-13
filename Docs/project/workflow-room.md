# TC Workflow Room

## Ringkasan

Project TC / Tien’s Catering menggunakan workflow berbasis room agar pengembangan tetap terarah, hemat token, dan aman secara scope.

## Room 00 — Master Room / Otak Project

Room 00 adalah pusat keputusan utama.

Tugas Room 00:
- menjaga arah project,
- menjaga tujuan project,
- menjaga scope,
- menentukan prioritas,
- menyusun roadmap batch,
- memutuskan kapan perlu meminta analisa Room 01,
- mengevaluasi hasil Room 01,
- membuat instruksi final untuk Gemini 3 Flash,
- mengevaluasi hasil eksekusi,
- memutuskan Accepted / revisi / Hold / lanjut batch berikutnya.

Jika Room 00 bingung atau scope tidak jelas, Room 00 harus bertanya kepada user terlebih dahulu.

Room 00 tidak boleh membuka scope baru tanpa keputusan user.

## Room 01 — Repository Analysis Only

Room 01 hanya bertugas membaca dan menganalisa repo/GitHub.

Tugas Room 01:
- membaca folder/file terkait,
- menganalisa client,
- menganalisa server,
- menganalisa docs,
- menganalisa database/schema/seed jika ada,
- menganalisa integrasi,
- menemukan gap,
- menemukan risiko teknis,
- menemukan risiko bentrok file,
- memberi rekomendasi kepada Room 00.

Room 01 tidak boleh:
- eksekusi,
- edit file,
- commit,
- push,
- mengambil keputusan final.

## Gemini 3 Flash — Executor

Gemini 3 Flash adalah executor murni.

Gemini hanya menjalankan instruksi final dari Room 00 satu kali per batch.

Gemini boleh melakukan satu kali check/smoke test/run check setelah eksekusi, lalu langsung melaporkan hasil.

Gemini tidak boleh melakukan loop check-fix-check atau perbaikan berulang tanpa instruksi batch baru.

## Alur Kerja

1. Room 00 menentukan arah dan scope.
2. Jika perlu analisa detail, Room 00 meminta Room 01.
3. Room 01 membaca repo dan melaporkan hasil.
4. Room 00 mengevaluasi hasil analisa.
5. Room 00 membuat instruksi final untuk Gemini 3 Flash.
6. Gemini mengeksekusi satu kali.
7. Gemini melakukan satu kali check.
8. Gemini melaporkan hasil.
9. Room 00 mengevaluasi dan memutuskan Accepted / revisi / Hold / lanjut batch berikutnya.
10. User melakukan commit dan push manual jika hasil diterima.

## Roadmap 10 Batch

Gunakan siklus roadmap 10 batch:

- Batch 1–4: eksekusi fitur, improvement, cleanup, atau stabilisasi.
- Batch 5: dokumentasi/docs sync/status sync.
- Batch 6–9: eksekusi fitur, improvement, cleanup, atau stabilisasi lanjutan.
- Batch 10: dokumentasi/review besar/roadmap sync.

Setiap 5 batch, hentikan pekerjaan frontend/backend/fitur dan rapikan dokumentasi.