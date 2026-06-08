# TC Feature History Index

This document lists the history of features discovered, documented, and verified in **Tien's Catering (TC)**.

## Feature Index

### F00 — Project Workflow Foundation
- **Description**: Adoption of the Existing Project Mode workflow. Establishes the discovery-first documentation principle, developer constraints, and safety guidelines.
- **Reference Document**: [Docs/project/workflow/EXISTING_PROJECT_MODE.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/project/workflow/EXISTING_PROJECT_MODE.md)
- **Status**: Completed (Validated)

### F01 — Project Structure Audit
- **Description**: Baseline scan of the codebase to document the existing directories, scripts, dependencies, database models, and entry points.
- **Reference Document**: [Docs/history/CURRENT_STATUS.md](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/Docs/history/CURRENT_STATUS.md)
- **Status**: Completed (Validated)

### F02 — SvelteKit Frontend Core
- **Description**: The core Svelte layout shells, navigation bars, and routing structure of the application.
- **Status**: Found (Needs Review)

### F03 — Local APIs & Routes
- **Description**: The endpoints located under SvelteKit's `/api/` directory that handle requests for menus, packages, orders, and review states.
- **Status**: Found (Needs Review)

### F04 — SQLite DB & System Settings
- **Description**: Local SQLite database storage structure and parameters (including `system_settings` tables for QRIS/bank transfer simulation).
- **Status**: Found (Needs Review)

### F05 — Auth & Developer Persona Switcher
- **Description**: Minimal auth mock handlers, customer profiles, and the Developer Persona Account Selector utility.
- **Status**: Found (Needs Review)

### F06 — Order Flow & Payment Verification
- **Description**: The cart module, stock-aware checkout flow, manual proof of payment upload, and the admin manual payment verification flow.
- **Status**: Found (Needs Review)

### F07 — Invoicing & Commercial Billing
- **Description**: Render templates for commercial billing, invoice print options, and payment instructions.
- **Status**: Found (Needs Review)

### F08 — Admin Operational Dashboard
- **Description**: Analytics summary metrics, order status filter tools, and admin action interfaces.
- **Status**: Found (Needs Review)
