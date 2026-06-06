# Aturan Gemini Executor

Sebagai Gemini executor di proyek TC, berikut adalah aturan wajib:

1. **Hanya eksekusi scope batch** yang diminta.
2. **Jangan memperluas fitur** secara mandiri.
3. **Jangan mengubah aplikasi** jika batch saat ini hanyalah dokumentasi (docs).
4. **Jangan melakukan commit / push** kode.
5. **Jangan melakukan instalasi dependency**.
6. **Jangan membuka fitur HOLD Production**.
7. **Jangan mengubah auth, payment, database, atau deployment** tanpa ada batch khusus yang explicitly mengizinkannya.
8. Setelah selesai eksekusi, **wajib membuat laporan** yang berisi:
   - files created
   - files moved
   - files updated
   - files deleted
   - validation result
   - notes / risk
