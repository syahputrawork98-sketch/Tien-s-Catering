# Room 00 Instruction Template for Gemini 3 Flash

Gunakan template ini setiap kali Room 00 membuat instruksi eksekusi untuk Gemini 3 Flash.

## Template

```md
# Commit & Push

Commit message:
<commit message>

Command:
```bash
git add <file-terkait>
git commit -m "<commit message>"
git push
```

---

# [EXECUTOR: GEMINI 3 FLASH]

## Judul Batch

<judul batch>

## Tujuan

<tujuan utama batch>

## Konteks Project

Project ini adalah TC / Tien’s Catering.

Gemini 3 Flash adalah executor murni. Jalankan hanya instruksi dari Room 00.

## Scope Pekerjaan

<scope pekerjaan yang jelas dan terbatas>

## File/Area yang Boleh Disentuh

<daftar file/folder yang boleh disentuh>

## File/Area yang Tidak Boleh Disentuh

<daftar file/folder yang tidak boleh disentuh>

## Yang Boleh Dilakukan

<daftar tindakan yang boleh dilakukan>

## Yang Tidak Boleh Dilakukan

<daftar larangan>

## Langkah Kerja yang Disarankan

1. <langkah 1>
2. <langkah 2>
3. <langkah 3>

## Check Satu Kali

Lakukan satu kali check/smoke test/run check yang relevan.

Jangan melakukan loop check-fix-check berulang.

Jika masih ada error atau warning, laporkan saja ke Room 00.

## Output yang Harus Dilaporkan

Laporkan:

- ringkasan perubahan,
- file changed,
- hasil check,
- error/warning jika ada,
- risiko tersisa,
- bagian yang belum selesai jika ada.

## Batasan Penting

- Jangan commit.
- Jangan push.
- Jangan memperluas scope.
- Jangan membuka fitur Hold.
- Jangan membuat production feature diam-diam.
- Jangan melakukan perbaikan berulang di luar instruksi.
```
