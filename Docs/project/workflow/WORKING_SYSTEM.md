# TC Working System

This document outlines the operational structure and working system used to develop, maintain, and audit **Tien's Catering (TC)**.

## Core Roles
- **Product Owner (User)**: Approves design plans, validates functional features, and executes Git operations (commits/pushes) to the repository.
- **AI Coding Assistant (Antigravity)**: Operates in the local IDE workspace. Responsible for reading codebase patterns, creating/updating documentation, proposing technical fixes, and validating local builds.

## Workflow Mechanics
To ensure safety and reliability in this production-ready application, work is structured around:

1. **Pre-Execution Planning**:
   - Detailed scanning of existing features.
   - Creating/updating implementation plans.
   - Requesting and obtaining Product Owner approval before modifying any application logic.
2. **Execution Phase**:
   - Small, focused modifications (1–3 files) or medium updates (4–8 files) at a time.
   - Large modifications must be split into smaller, manageable chunks to prevent regressions.
3. **Validation**:
   - Testing components, page routes, and API responses locally.
   - Ensuring `npm run check` returns `0 errors` and the build compiles cleanly before completing tasks.
4. **Post-Execution Acceptance**:
   - Submitting an Executor Report listing files modified, scope alignment, and safety confirmations.

## Feature Batch Naming Policy
When organizing tasks, documentation, and feature assessments, the following naming scheme is used:
- `F00` - Project Workflow Foundation (Adoption of TC Existing Project Mode)
- `F01` - Project Structure & Audit Documentation (Mapping codebases)
- `F02` - SvelteKit Frontend Core
- `F03` - API / SvelteKit Backend routes
- `F04` - SQLite Local Database Simulation
- `F05` - Developer Persona Switcher & Authentication Guards
- `F06` - Order Flow & Manual Payment Verification
- `F07` - Invoicing & Commercial Billing
- `F08` - Admin Operational Monitor & Analytics Dashboard
- `FXX-CP` - Documentation Checkpoint / Progress Sync

## Definition of Done
A batch is considered completed if and only if:
1. All instruction criteria and acceptance conditions are fulfilled.
2. No syntax errors, build issues, or regressions are introduced.
3. Relevant documentation (such as `CURRENT_STATUS.md` and feature files under `Docs/history/`) is updated.
4. An Executor Report is provided.
5. The Product Owner reviews, verifies, and commits/pushes the changes to the repository.

## Documentation Layers

To keep documentation clean and separated, the `Docs/` directory is structured as follows:

- **`Docs/project/` (Workflow Layer)**: Contains rules, setup guidelines, model guidelines, and system workflows (e.g., `EXISTING_PROJECT_MODE.md`, `WORKING_SYSTEM.md`).
- **`Docs/history/` (Persistent Memory Layer)**: Contains the central status files (`CURRENT_STATUS.md`, `FEATURE_HISTORY.md`) and the folder `features/` detailing the audit state of each feature.
- **`Docs/frontend/`**: Navigation maps and file references for frontend Svelte/SvelteKit components.
- **`Docs/backend/`**: Navigation maps and file references for backend API endpoints and server guards.
- **`Docs/database/`**: Navigation maps for SQLite schema, tables, and system setting records.
- **`Docs/development/`**: Instruction manuals for local setup and commands.

## Safety Rules
- **No Secrets**: Never commit environment credentials, private API keys, or actual user passwords.
- **Git Boundaries**: AI executors do not perform `git commit` or `git push` directly.
- **Locked Boundaries**: Never modify HOLD areas unless explicitly instructed.
