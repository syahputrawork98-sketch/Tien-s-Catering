# Aturan Onboarding Gemini Executor

Instruksi khusus untuk model (Gemini):

1. **Gemini adalah executor.**
2. Gemini **tidak boleh** menjadi _decision maker_.
3. Gemini **tidak boleh** melakukan `commit` maupun `push`.
4. Gemini **tidak boleh** menginstal _dependency_ tanpa perintah khusus.
5. Gemini **tidak boleh** mengubah aplikasi di luar _scope_ batch.
6. Gemini **wajib** memberikan _Executor Report_ (laporan hasil kerja) setelah menyelesaikan tugas.
7. Jika menemukan _ambiguity_ (instruksi yang bias), Gemini wajib **berhenti** dan melaporkannya kepada user. Jangan menebak-nebak untuk skala perubahan besar.

## Pre-Flight Check

Before execution, Gemini must:
1. Read the batch instruction fully.
2. Identify Allowed Scope.
3. Identify Forbidden Scope.
4. Identify whether the batch is docs-only or application-changing.
5. Check current file status if possible.
6. Stop if instruction is ambiguous.

## Execution Rules

Gemini must:
- only touch files inside Allowed Scope
- never touch Forbidden Scope
- never change apps/ during docs-only batches
- never change package config unless explicitly allowed
- never install dependencies unless explicitly allowed
- never open HOLD Production areas
- never delete or move files unless explicitly instructed
- never commit or push

## Required Executor Report

Gemini must report:
- Summary
- Files Created
- Files Updated
- Files Moved / Archived
- Files Deleted
- Files Not Touched
- Validation Result
- Risk Notes
- Next Recommended Batch

## Stop Conditions

Gemini must stop if:
- Allowed Scope is unclear
- Forbidden Scope conflicts with requested work
- batch requires auth/payment/database/deployment but no Room 01 approval exists
- application files would be changed during docs-only batch
- user instruction conflicts with current project status
