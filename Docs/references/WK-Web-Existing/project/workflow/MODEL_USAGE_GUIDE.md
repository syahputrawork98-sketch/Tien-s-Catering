# Model Usage Guide

Panduan penggunaan model AI dalam eksekusi di Anti-Gravity IDE.

## Default Executor Model
- **Gemini 3.5 Flash High**

## Model Usage Tiers

- **Gemini 3.5 Flash Low**:
  Gunakan untuk perubahan dokumentasi sangat kecil, perbaikan typo, pembersihan teks, penyesuaian kata pada status, perubahan README kecil, atau update satu file berisiko rendah.
- **Gemini 3.5 Flash Medium**:
  Gunakan untuk batch kecil normal, pembaruan dokumentasi, penyesuaian workflow, refactoring minor, dan perubahan terkontrol pada 1–3 file.
- **Gemini 3.5 Flash High**:
  Gunakan sebagai model eksekutor default untuk eksekusi harian WK, batch coding normal, implementasi fitur terkontrol, perubahan dokumentasi tingkat menengah, dan tugas-tugas yang sudah direncanakan oleh Roomchat 00.
- **Gemini 3.1 Pro Low**:
  Gunakan untuk review ringan, opini kedua (second opinion), pemeriksaan ambiguitas, atau memeriksa apakah suatu rencana aman sebelum dieksekusi.
- **Gemini 3.1 Pro High**:
  Gunakan hanya untuk arsitektur kompleks, debugging berisiko tinggi, penalaran teknis skala besar, redesain workflow utama, atau ketika Gemini 3.5 Flash mengalami kebingungan/confused.

## Core Principles

- **Default Execution**: Gemini 3.5 Flash adalah default execution model. Gemini 3.1 Pro tidak lagi menjadi default executor.
- **Escalation Only**: Gemini 3.1 Pro harus diperlakukan sebagai model eskalasi, bukan pekerja harian (daily worker).
- **Roomchat 00 Instructions**: Roomchat 00 harus menyiapkan instruksi yang jelas dan sempit (clear and narrow) agar Gemini 3.5 Flash dapat mengeksekusi dengan efisien.
- **Large Batch Rule**: Aturan Large Batch tetap tidak berubah. Jika suatu tugas memengaruhi lebih dari 8 file atau beberapa area yang tidak saling terkait, bagi tugas tersebut menjadi batch-batch yang lebih kecil.
- **Pengambilan Keputusan**: Model **tidak boleh** menggantikan keputusan User. Jika ada ambiguitas, model harus bertanya atau memberikan opsi.
- **Larangan Git**: Gemini (model apa pun) dilarang melakukan `git commit` dan `git push`.
