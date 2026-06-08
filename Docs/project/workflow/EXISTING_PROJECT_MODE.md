# TC Existing Project Mode

## Purpose
TC (Tien's Catering) is an existing codebase currently in the *Production Readiness* phase. To maintain safety, code hygiene, and strict project tracking, TC operates under **Existing Project Mode**. This document defines the rules, boundaries, and working flows required to perform any documentation, status tracking, or development tasks inside the project.

## Adopted Principle: Discovery-First Documentation
Before making any technical changes, refactoring, or additions to the codebase, we must follow the **Discovery-First Documentation** principle. 
- Do not assume the project is empty or needs to be built from scratch.
- Do not immediately refactor or redesign application elements.
- Discover, document, and map existing systems first to establish a clear audit trail.

## TC Project Boundary
TC keeps its own established stack and project structure:
- **Frontend Framework**: SvelteKit and Svelte.
- **Styling**: TailwindCSS.
- **Local Database**: SQLite local database simulation (specifically `system_settings` and related SQLite structures).
- **Core APIs**: SvelteKit local API routes (e.g., `/api/health`, `/api/menus`, `/api/orders`, `/api/packages`, `/api/package-requests`).
- **User Personas**: Integrated Svelte components like the Developer Persona Account Selector.
- **Authentication**: SvelteKit session guards and roles/permission validation.

## Required Working Flow
Every feature task, code assessment, or bug fix must strictly follow this flow:

$$\text{temukan} \longrightarrow \text{catat} \longrightarrow \text{petakan} \longrightarrow \text{update status} \longrightarrow \text{baru perbaiki}$$

1. **Temukan (Discover)**: Search and scan the codebase to find where the feature's logic, components, routes, and data structures are currently implemented.
2. **Catat (Document)**: Document what already exists, noting down file locations, parameters, and design logic.
3. **Petakan (Map)**: Map the exact relationships between the Frontend (UI components), Backend/API, Database (SQLite tables), and other dependent features.
4. **Update Status (Update Status)**: Update the feature status in central docs (`CURRENT_STATUS.md`, `FEATURE_HISTORY.md`, or the specific feature documentation in `Docs/history/features/`).
5. **Baru Perbaiki (Fix/Develop)**: Only after steps 1–4 are completed and approved may any technical fixes, adjustments, or logic improvements be proposed.

## Feature Status Rule
Existing or structurally present features must not be automatically assumed to be `Completed` or `Done`.
- **Validation Requirement**: A feature is not marked as `Completed` unless it is fully tested and validated to work functionally in the environment.
- **Validation/Pending Mode**: Structurally present features (such as F02–F08 or any newly discovered features) must stay in a pending validation state (`Needs Review` or `Partial`) until they are explicitly verified and accepted.
- **Standard Technical Relation Statuses**:
  - `Found`: File/code is located and verified.
  - `Needs Review`: Code/table exists but needs validation.
  - `Unknown`: Unsure if the feature has a related component/API/table.
  - `Not Required`: The feature does not need this area (e.g., static page doesn't need a DB).
  - `Partial`: Part of the component/API is found, but some parts are missing.
  - `Blocked`: Cannot map/validate due to errors or workspace limitations.

## HOLD Areas
The following areas are locked in this mode and must not be touched or modified:
- **Application Code**: No changes in `apps/` or `apps/src/` (including frontend components and backend/API logic).
- **Database Schema**: No changes to the database structure or SQLite tables.
- **Security & Guards**: Ownership isolation, server-side/client-side role access guards, and session logic.
- **Payment & Invoicing**: Payment flow, QRIS verification, bank transfer details, and billing validation.
- **Authentication System**: Auth production systems (JWT, reset password logic).
- **Production Configuration**: Build scripts, package dependencies (`package.json`, `package-lock.json`), environment variables (`.env`), and deployment details.

## Executor Rules
- **Scope**: Docs-only. No app code or database files may be altered.
- **Integrity**: Maintain the existing SvelteKit structure without introducing external templates.
- **Traceability**: All updates to files must be documented in the Executor Report.
