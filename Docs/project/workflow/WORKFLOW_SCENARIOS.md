# Workflow Scenarios

Panduan skenario untuk pengerjaan batch:

## 1. Docs-only correction
- **Need Room 01 Review:** No
- **Need User Confirmation:** No
- **Allowed Executor:** Gemini
- **Allowed Scope:** Docs/project/, Docs/history/, Docs/archive/
- **Forbidden Scope:** apps/, config, db, dll.

## 2. Existing app inventory
- **Need Room 01 Review:** Optional
- **Need User Confirmation:** Yes
- **Allowed Executor:** Gemini
- **Allowed Scope:** docs only (pembacaan aplikasi diperbolehkan tanpa merubah kode)
- **Forbidden Scope:** Dilarang merubah aplikasi.

## 3. Feature audit
- **Need Room 01 Review:** Optional
- **Need User Confirmation:** Yes
- **Allowed Executor:** Gemini
- **Allowed Scope:** docs, evaluasi fitur.
- **Forbidden Scope:** Dilarang merubah fungsionalitas fitur.

## 4. Small frontend patch
- **Need Room 01 Review:** Optional
- **Need User Confirmation:** Yes
- **Allowed Executor:** Gemini
- **Allowed Scope:** file UI, komponen frontend kecil.
- **Forbidden Scope:** backend, database, state management utama.

## 5. Backend/API change
- **Need Room 01 Review:** Yes
- **Need User Confirmation:** Yes
- **Allowed Executor:** Gemini
- **Allowed Scope:** endpoint API, logic handler.
- **Forbidden Scope:** auth, security, database migration tanpa skenario khusus.

## 6. Database change
- **Need Room 01 Review:** Yes
- **Need User Confirmation:** Yes
- **Allowed Executor:** Gemini
- **Allowed Scope:** schema, migration, seeders.
- **Forbidden Scope:** UI/frontend, kecuali butuh penyesuaian wajib.

## 7. Payment/security/auth change
- **Need Room 01 Review:** Yes
- **Need User Confirmation:** Yes
- **Allowed Executor:** Gemini
- **Allowed Scope:** modul payment, auth rules, middleware.
- **Forbidden Scope:** Merubah flow utama bisnis tanpa persetujuan eksplisit.

## 8. Deployment/production readiness
- **Need Room 01 Review:** Yes
- **Need User Confirmation:** Yes
- **Allowed Executor:** Gemini
- **Allowed Scope:** docker, config deployment, cloud setting.
- **Forbidden Scope:** Dilarang release langsung tanpa review. HOLD wajib approval user.

## 9. Documentation checkpoint
- **Need Room 01 Review:** No
- **Need User Confirmation:** Yes
- **Allowed Executor:** Gemini
- **Allowed Scope:** docs/history update.
- **Forbidden Scope:** apps/
