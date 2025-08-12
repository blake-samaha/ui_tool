# Cognite Docs-as-Code UI — Product and Architecture Plan

## Introduction

This document outlines a concise product and engineering plan for a browser UI
that powers a schema-driven, docs-as-code workflow for Cognite Data Fusion
(CDF) projects. The UI abstracts Cognite Toolkit YAML complexity and lets teams
capture requirements in structured, human-readable form. The goal is a guided,
validating, and repeatable flow that reduces errors and speeds delivery.

Guiding principles:

- Maintainability: choose tools and patterns that are easy to evolve.
- Scalability: support more templates, richer validation, and more users.
- Developer experience: favor productivity, correctness, and type safety.

### Demonstration vs product scope

- Purpose: this UI is a single component in a larger docs-as-code workflow.
  Its value is demonstrated only when the full workflow runs end to end. If we
  cannot complete the full workflow, the tool does not meet its purpose.
- Product (UI) responsibilities
  - Ingest unstructured inputs and render schema-driven forms.
  - Validate inputs and emit structured YAML requirements templates and UI-state JSON:
    - `00_Solution_Design_Principles.yaml` (project-wide)
    - `01_Conceptual_Model.yaml` per module
    - `XX_Object_Specs/*.yaml` per object
    - UI-state JSON snapshots for round-trip editing
    - Note: These are requirements YAML files, not CDF Toolkit YAML.
  - Provide copy/export of generated templates and write outputs to
    `project_templates/**`.
- Demonstration responsibilities (outside the UI but required for the final
  demo)
  - Use an AI assistant (LLM) with detailed prompts to generate/patch the CDF
      repo structure and non-UI-managed files.
  - Load synthetic CSVs into RAW and run the minimal transformations.
  - Deploy via Toolkit/CI and verify model instances via queries.
- Boundary: the UI starts at reading unstructured docs and ends at emitting the
  validated templates and YAML. The demo continues through AI-assisted repo
  updates, deployment, and verification.
 - Explicit scope boundary: the UI never connects to CDF or any cloud service.
   All CDF-related identifiers (for example, `space`, `cdf_cluster`,
   `cdf_region`, IdP group source IDs) are collected from the user and only
   written to output templates; they are not validated or used by the app.
 - Non-negotiable for demo: all three templates (00, 01, XX) must be
   completed; Tier 1 alone is insufficient to generate a deployable and
   populated model.

## 1. Technology Stack

- React: mature ecosystem for complex UI needs.
- TypeScript: strict typing for safety, refactoring, and documentation.
- Vite: fast dev server and HMR, first-class TS/React support.
- Tauri: optional desktop packaging for offline, single-binary distribution.
- pnpm: package manager for reproducible installs and workspace management.

## 2. Schema-Driven UI Architecture

- Dual-Schema Architecture
  - Data Schema (Zod): single source of truth for data shapes and
      validation; TS types inferred via `z.infer`.
  - UI Schema (JSON): presentation-only metadata for layout, labels, and
      components.
- Form State: React Hook Form with Zod resolver for high-performance,
  schema-backed validation.
- UI Components: Radix primitives styled with Tailwind; Shadcn/ui provides
  copy-in components for full ownership.
- FormRenderer: recursively maps the UI Schema to components, wiring each
  field via RHF `Controller` to bind `onChange`, `value`, and errors. Adding
  fields becomes a schema change, not a code change.

## 3. MVP

### 3.1 User stories (all three tiers in MVP — Tier 1 alone is insufficient)

- As a Solution Architect, I can complete Tier 1
  (`00_Solution_Design_Principles.yaml`), get real-time validation, and produce
  the project-level YAML requirements template and UI-state JSON.
- I can complete Tier 2 (`01_CONCEPTUAL_MODEL_TEMPLATE.yaml`), validate, and
  produce the module-level YAML requirements template and UI-state JSON.
- I can complete Tier 3 (`XX_Object_Specification_Template.yaml`), validate, and
  produce object-level YAML requirements templates and UI-state JSON.

### 3.2 Scope (features — deliver all tiers to complete end-to-end demo)

- Zod Data Schemas for all three templates (00, 01, XX).
- JSON UI Schemas for all three templates.
- FormRenderer produces interactive forms from schemas for each tier.
- Basic navigation across tiers (tabs or wizard) to complete the full set.
- Basic inputs: text, textarea, select (Shadcn/ui + Radix + Tailwind).
- RHF + Zod validation with clear per-field errors.
- Template generation (YAML requirements) entirely client-side.
- Read-only YAML preview with "Copy to Clipboard" and file export.
- Project root selector and multi-repo switcher: choose a repo root on launch,
  switch via a Recent Projects menu, read/write only under the selected root,
  and initialize `project_templates/` if absent.
- Runtime inputs captured in the UI and emitted to templates (no external
  auth or cloud calls): `moduleId`, target `space`, environment details
  (`cdf_cluster` / `cdf_region`), IdP group source IDs (admin/user), and
  company naming conventions. These are required for output generation but
  do not gate app startup.
- Relationships: support both `direct` and `edge` types in forms.
  For `edge`, collect and validate `edgeSpace`, `edgeTypeExternalId`,
  optional `label`, and `multiplicity`.
 - Outputs produced by the UI (files only):
   - Project-level and module/object-level YAML requirements templates under
     `project_templates/**`.
   - UI-state JSON snapshots under `project_templates/**/ui-state/` for
     round-trip editing.
   - Note: The UI does not generate CDF Toolkit YAML. Downstream conversion
     of the requirements YAML into Toolkit YAML is performed outside of the
     UI (AI-assisted or scripted).

### 3.3 Out of scope

- Other templates; dynamic template selection (beyond the minimal demo set).
- External integrations (playbooks, API calls, commits, webhooks).
- In-app authentication or user accounts (the app does not authenticate users);
  note: the app may emit access group YAML as output artifacts but does not
  perform any auth.
- Backend persistence or multi-user storage. Persistence is file-based only
  under `project_templates/**` with optional localStorage cache.
- Advanced UI (conditional fields, repeating groups, custom widgets).
- Scheduling/orchestration of transformations and workflows (beyond a single
  demo run).
- Observability and alerting integrations (e.g., Slack/PagerDuty) and related
  SLAs are excluded for the MVP.

### 3.4 Acceptance checklist (MVP is complete only when all tiers are done)

- Common platform
    - RHF + Zod integration provides schema-driven, real-time validation.
    - FormRenderer renders fields from UI schema; submit only when valid.
    - Output view shows YAML requirements templates with copy/export.
    - Project root selection and multi-repo switching; persists a list of
      recent roots in localStorage.
    - Validates selected root is writable; offers to create
      `project_templates/` when missing.
    - Round-trip persistence: load previously saved `ui-state/*.json` for
      Tier 00/01/XX to rehydrate forms without retyping.
    - Deterministic emit: YAML generation uses stable field ordering and
      formatting for minimal diffs.
    - Web-first delivery: static web app + local file-bridge in Phase 1.
      Tauri desktop packaging is deferred to Phase 2.
  - Relationship support: forms capture `direct` and `edge` relations.
    For `edge`, required metadata (`edgeSpace`, `edgeTypeExternalId`) is
    validated.
    - Status: Not started.
- Tier 1 — `00_Solution_Design_Principles.yaml`
    - Zod Data Schema matches fields, types, and rules.
    - JSON UI Schema covers components, labels, placeholders.
    - Outputs: `project_templates/00_Solution_Design_Principles.yaml` and
      `project_templates/ui-state/00_solution_design.json`.
    - Status: Not started.
- Tier 2 — `01_CONCEPTUAL_MODEL_TEMPLATE.yaml`
    - Zod Data Schema for core objects and relationships.
    - JSON UI Schema with basic repeatable lists for objects and relationships.
    - Outputs: `project_templates/modules/<module>/01_Conceptual_Model.yaml` and
      `project_templates/modules/<module>/ui-state/01_conceptual_model.json`.
    - Status: Not started.
- Tier 3 — `XX_Object_Specification_Template.yaml`
    - Zod Data Schema for properties, relationships, container spec.
    - JSON UI Schema with basic repeatable lists for properties and relations.
    - Outputs: `project_templates/modules/<module>/XX_Object_Specs/<object>.yaml`
      and
      `project_templates/modules/<module>/ui-state/xx/<object>.json`.
    - Status: Not started.

### 3.5 Wizard-style UI (MVP)

- Goals
    - Reduce cognitive load by guiding users step-by-step through each template
    - Make progress clear, prevent invalid submissions, and provide an easy review before export
    - Enable targeted collaboration and review on specific sections without scrolling large forms
- Navigation and behavior
    - Linear Next/Back navigation with a visible Stepper showing current step and completion state
    - Steps are individually validated; users cannot proceed if step has blocking errors
    - Users may jump back to previously completed steps; future steps remain disabled until unlocked
    - Wizard state persists in memory, autosaves to `ui-state/*.json` on step completion; manual Save available at any time
    - Final Review step shows a read-only summary and YAML preview with Copy/Export buttons
- Validation
    - Zod schema is reused at step-scope: each step validates only the fields it owns
    - Cross-step validations run on Review; errors link back to the corresponding step
    - Conditional validations are enforced (for example, `edge` relationships require `edgeSpace` and `edgeTypeExternalId`)
- File I/O
    - Autosave `ui-state/*.json` after each successful step validation
    - Export writes the tier YAML and the `ui-state/*.json` snapshot deterministically
    - Writes are limited to `project_templates/**` via the local file-bridge
- YAML preview
    - Visible in the Review step; Copy to clipboard is available
    - Optional on-demand preview per step to reduce distraction
- Accessibility and UX
    - Keyboard navigation (Enter to continue, Shift+Tab/Tab between fields)
    - Clear, compact help text per field; error messages shown inline and in a step-level summary
    - Persistent progress indicator and unsaved-changes prompts when navigating away

Wizard step breakdown per tier

- Tier 00 — Solution Design Principles
    1. Project Overview: `moduleId`, `projectId`
    2. Environments: `environments[]` (all fields)
    3. Space: `space.externalId`, `space.description`
    4. RAW Sources: `rawSources[]`
    5. Toolkit: `toolkit.*`
    6. Promotion: `promotion.*`
    7. Access Roles: `accessRoles[]`
    8. Global Standards: `globalStandards.*`
    9. Core Model Inheritance: `coreModelInheritance.assetView`, `coreModelInheritance.eventView`
    10. External Models: `externalModels[]`
    11. Observability: `observability.*`
    12. ID Macros: `idMacros.*`
    13. Review & Generate: summary table and YAML preview

- Tier 01 — Conceptual Model
    1. Module Basics: `schemaVersion`, `moduleId`
    2. Objects: `objects[]`
    3. Relationships: `relationships[]` (enforce edge metadata when type=`edge`)
    4. External References: `externalReferences[]`
    5. Data Model: `dataModel.*`
    6. Performance Hints: `performanceHints.*`
    7. Review & Generate

- Tier XX — Object Specification
    1. Basics: `schemaVersion`, `moduleId`, `objectId`
    2. Description: `description.summary`, `description.externalId`
    3. Identifiers: `identifiers.viewExternalId`, `identifiers.containerExternalId`
    4. Data Source & Lineage: `dataSource.*`
    5. Properties: `properties[]`
    6. Container Spec: `containerSpecification.*`
    7. Relationships: `relationships[]` (with edge metadata check)
    8. View Configuration: `viewConfiguration.*`
    9. Time Series: `timeSeries[]`
    10. Transformation Plan: `transformationPlan.*`
    11. Data Quality: `dataQuality.rules[]`
    12. Observability & Orchestration: `observability.*`, `orchestration.*`
    13. Review & Generate

Implementation plan (high-level)

- Step registry
    - Define a per-tier registry of steps mapping to subsets of the Zod schema and the corresponding UI schema fragments
    - Each step specifies: `id`, `title`, `fieldsScope` (paths), `uiSchema`, and optional `help`
- Wizard shell
    - Reusable `Wizard` component renders Stepper, navigation, content slot, and the Review step
    - Integrates React Hook Form and Zod at step-scope; advances only when the step validates
- Persistence
    - On step success: autosave `ui-state/*.json` to `project_templates/**`
    - Load precedence remains: UI-state first, then YAML import, else empty
- Routing
    - Route per tier (`/tier00`, `/tier01`, `/tierXX`) retains current `stepId` in the querystring for deep links (for example, `/tier01?step=relationships`)
- Deterministic export
    - Review step calls the YAML emitter; Copy/Export buttons surface next actions
- Non-functional
    - Step transitions under 200ms on modern laptops
    - Autosave writes under 200ms typical

Acceptance criteria (Wizard)

- Users can complete all steps for Tier 00/01/XX with clear progress indication and gating on invalid data
- Review step shows a cohesive summary and YAML preview; Copy/Export work as expected
- Autosave to `ui-state/*.json` occurs at step completion; reload restores wizard progress and data
- Direct navigation to a specific step is disallowed until preceding steps are valid; back navigation is always allowed
- Deterministic YAML emit and no trailing spaces/newline behavior preserved

### 3.6 Home page and onboarding

- Purpose
    - Provide a clear introduction to the project, what the wizard will do, and what files will be produced under `project_templates/**`
    - Offer a single entry point to start the guided flow and set the working repository root
- Content and layout
    - Title and short description: explain Docs-as-Code UI, local-only behavior, and the three template tiers (00/01/XX)
    - “What you will do” checklist:
        - Select a repository root (local folder) for `project_templates/**`
        - Complete Tier 00 → Tier 01 → Tier XX
        - Review and export YAML and UI-state JSON
    - “Start Wizard” primary button
    - Secondary actions: View documentation (link to this requirements doc), Open recent project roots (dropdown)
- First-time flow
    - On click “Start Wizard”:
        - Step 0 — Select Project Root
            - Show an input for absolute path to the repo root; prefill from recent roots if available
            - Bridge health indicator (must be OK to proceed)
            - Validate that `project_templates/` exists; if missing, offer “Initialize project templates” (creates required folders and seed files)
            - Persist the selected root in localStorage; add to Recent roots
        - Navigate to Tier 00, Step 1 on success
- Returning users
    - If a valid recent root is present and writable, allow “Continue where I left off” which loads UI-state and resumes the wizard at the last completed step
    - Otherwise return to Step 0 to select a root

### 3.7 UI/UX implementation details (cross-tier)

- Wizard shell and navigation
    - Left-aligned Stepper shows steps with completion badges; disabled future steps
    - Controls: Back, Save & Continue; keyboard shortcuts (Enter to continue)
    - Step-scoped autosave with timestamp (for example, “Saved at 14:03:12”)
    - Optional “Skip, fill later” for non-required steps, flagged on the Review page
- Presentation and readability
    - Use Section cards with concise helper text; collapse advanced/optional groups
    - Arrays (objects, relationships, properties) rendered as table-like row editors for clarity
    - Pattern hints and examples inline (for example, `moduleId` regex and sample)
    - Chips for categorical inputs (guardrails, capabilities) rather than free text
    - Compact right-side live summary that updates as users type (toggleable)
- Validation and guidance
    - Zod validation at step-scope; inline field errors + step-level error summary
    - Cross-step validation on Review with links back to steps; “Jump to first error” action
    - Conditional validations (edge relationships) enforced with contextual guidance
    - Smart defaults derived from prior answers (for example, prefix external IDs with `moduleId`)
- Review & Generate
    - Summary grouped by sections; expandable details
    - YAML preview with Copy/Download; optional diff against the last exported YAML
    - Per-step “Preview YAML fragment” toggle for focused verification (optional)
- File I/O & persistence
    - Autosave on successful step validation to `ui-state/*.json` under the selected root
    - Export writes YAML and UI-state deterministically; bridge errors are surfaced via toasts
    - “Initialize project templates” action when the root is empty; creates required folders
- Styling and components
    - Core components: `WizardShell`, `Stepper`, `SectionCard`, `FieldArrayTable`, `YAMLPreviewPanel`, `Toast`
    - Accessible color contrast, readable spacing, and dark mode support
- Performance and resilience
    - Virtualization for long arrays; debounced autosave; lazy YAML preview rendering for large documents
    - Smooth step transitions (<200ms typical)
- Accessibility and i18n
    - ARIA roles on stepper and nav; focus management on step transitions
    - Error announcements for screen readers; keyboard-only usability
    - Externalize static labels to enable future localization


## 4. Phased Plan

### Phase 1: Foundation (MVP)

- Build items in the acceptance checklist.
- Include a minimal end-to-end demo path:
  - Generate data model YAML and project config.
  - Generate RAW schemas and load synthetic CSVs into RAW.
  - Generate one or two SQL Transformations to populate selected views.
  - Verify instances exist in the data model via Graph/Instances queries.
- Outcome: working form for Tier 1 template, valid YAML output, and a small
  data-to-model population demo proving the workflow end-to-end.

Wizard deliverables in Phase 1

- Implement `WizardShell`, `Stepper`, `SectionCard`, `FieldArrayTable`, `YAMLPreviewPanel`, `Toast`
- Build step registries and step-scoped validation for Tier 00, Tier 01, and Tier XX
- Home page onboarding with “Start Wizard” and Step 0 (project root selection, bridge health, init flow)
- Autosave to `ui-state/*.json` after each step; deterministic export on Review
- Recent roots menu and writable-root validation; CORS-enabled dev bridge

### Phase 2: Template Expansion and Abstraction

- Add Zod and UI schemas for module-level and object-level templates.
- Introduce a Template Registry mapping template IDs to schemas.
- Enable dynamic loading/selection to render any template on demand.
- Outcome: platform supports all three template types.

Wizard enhancements in Phase 2

- ERD preview for Tier 01/XX (read-only) to visualize relationships
- Per-step YAML fragment preview toggles; diff against last export in Review
- Import existing YAML to prefill and auto-create missing steps

### Phase 3: Workflow Integration and Automation

- Downstream: have "Generate YAML" trigger an automated process (webhook,
  commit, pipeline) to align with playbooks.
- Upstream: "Load from YAML" parses existing YAML templates to pre-fill the form.
- Advanced forms: add repeating groups (`useFieldArray`) and conditional
  visibility.
- Outcome: integrated, round-trip workflow with automation across model,
  RAW loading, and transformations.

Wizard extensions in Phase 3

- Webhook/commit trigger after export (optional) and CI status feedback (out of scope in MVP)
- Add collaborative review mode (non-persistent) to annotate Review summary (future)

### Phase 4: Enterprise Hardening

- AuthN/Z (OIDC/OAuth2), roles and permissions if needed.
- Persistence (localStorage → backend service) for drafts and multi-device
  work.
- Audit trail/versioning (ideally Git-based) for traceability.
- UX polish: theme, tooltips/help, accessibility, visual refinement.
- Outcome: secure, multi-user, production-ready tool.

## 5. Recommendations and Outlook

- Use React + TS + Vite; model data once in Zod; render via a UI schema.
- Own component code (Shadcn/ui) for flexibility and long-term control.
- Keep logic in schemas; keep rendering generic and recursive.
- Extend by adding schemas and a registry, not by rewriting code.
- For the demo workflow, prefer minimal, well-typed SQL transformations that
  read synthetic CSVs in RAW and populate a small set of views. Keep scope to
  correctness, not performance.

## 5.1 Non-functional constraints (MVP)

- Local-only, offline: no outbound network calls, no auth, no cloud access.
- Data residency: all data lives in browser memory until explicitly exported to
  disk; files written only under the repo tree specified by the user.
 - Deterministic emit: stable key ordering, consistent indentation, and YAML
   anchors avoided to keep diffs small; end-of-file newline; no trailing spaces.
 - Round-trip editing: UI can load `project_templates/ui-state/*.json` snapshots
    to rehydrate forms and can import existing `project_templates/**/*.yaml` to
    prefill fields.
- No persistence guarantees: if users do not export or save, state is lost on
  refresh; optional localStorage cache is allowed for convenience.
- Performance targets: forms render under 300ms on modern laptops; file emit
  under 200ms for typical modules.

## 5.2 Visual design and branding

- Aesthetic: align with Cognite documentation look and feel. Follow
  typography and color direction from the Cognite documentation site
  ([Cognite documentation](https://docs.cognite.com/)).
- Fonts: use Inter (preferred) with system fallbacks
  (system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif).
- Color direction:
  - Primary brand blue consistent with Cognite Docs.
  - Neutral gray scale for backgrounds, borders, and text.
  - Accent colors for success/warning/error states.
- Implementation:
  - Define Tailwind theme tokens mapped to the brand palette and typography.
  - Final tokens will be synced from Cognite Docs styles during build to
    ensure exact alignment with the site referenced above.
  - App naming: working title "Cognite Docs-as-Code UI" for internal testing.
  - App icon: simple monogram aligned with Cognite Docs styling; dark/light
    variants for OS themes.

## 6. Workflow and Repository Structure

### 6.1 High-level system workflow

1. Human Architect: edits YAML requirements in a Git repo.
2. UI Application: loads YAML requirements and schemas, shows a structured form.
   - Can import from `project_templates/` (YAML) and/or
     `project_templates/ui-state/` (JSON) to prefill fields.
3. Human Architect: reviews and fixes data with real-time validation.
4. UI Application: generates structured data (YAML/JSON) on approval.
   - Writes back to `project_templates/` and `project_templates/ui-state/`
     for round-trip edits.
5. AI-assisted workflow (outside the UI): architects/engineers use LLMs to
   translate templates into CDF Toolkit YAML.
6. Git Repository: human-in-the-loop reviews diffs and commits generated YAML.
7. CI/CD: validates and deploys via Cognite Toolkit to CDF.
8. CDF: receives configuration (modules, models, transformations).

### 6.2 Scalable monorepo structure (with `project_templates/`)

To scale across many modules, organize a monorepo by capability and align with
Toolkit conventions.

```text
/my-cdf-project/
|-- packages/
|   |-- ui-application/             # React UI app (local-only)
|   |   `-- README.md
|   `-- shared-types/               # Shared TS types and base Zod schemas
|
|-- project_templates/              # UI-owned inputs + snapshots (source-of-truth)
|   |-- 00_Solution_Design_Principles.yaml
|   |-- ui-state/
|   |   `-- 00_solution_design.json
|   `-- modules/
|       |-- well_performance/
|       |   |-- 01_Conceptual_Model.yaml
|       |   |-- XX_Object_Specs/
|       |   |   |-- well.yaml
|       |   |   `-- compressor.yaml
|       |   `-- ui-state/
|       |       |-- 01_conceptual_model.json
|       |       `-- xx/
|       |           |-- well.json
|       |           `-- compressor.json
|       `-- another_module/
|
|-- cdf-modules/
|   |-- module-xyz/
|   |   |-- auth/
|   |   |   `-- groups.Group.yaml
|   |   |-- data_models/
|   |   |   |-- containers/
|   |   |   |   `-- well.Container.yaml
|   |   |   |-- views/
|   |   |   |   `-- well.View.yaml
|   |   |   `-- models/
|   |   |       `-- network.Model.yaml
|   |   `-- transformations/
|   |       `-- raw_to_dm_well.Transformation.yaml
|   `-- module-analytics-timeseries/
|
|-- cdf.toml
|-- config.dev.yaml
|-- config.prod.yaml
`-- ...
```

Key principles:

- Root holds monorepo and Toolkit configs.
- `packages/` for independent apps/libs; `shared-types/` for reusable types.
- `project_templates/` is the human-editable source the UI owns; it is separate
  from `cdf-modules/` to avoid crowding Toolkit YAML with design metadata.
- `project_templates/ui-state/` stores typed JSON snapshots for round-trip.
- `project_templates/modules/<module>/` holds 01/XX for each data model.
- The UI reads/writes only `project_templates/**` and never writes under
  `cdf-modules/**`.
- Add modules by copying a template; minimal cross-module coupling.
- CI/CD can deploy only changed modules for efficiency.

### 6.3 Local development and testing in a single repository

- Goal
    - Allow developers to build and test the UI end-to-end within this monorepo without maintaining a separate target repo
- Approach
    - Use a subfolder in this repository as the “project root” (for example, the repository root or a sibling folder such as `./demo_project`)
    - The app will read/write only under `<selected_root>/project_templates/**` via the local file-bridge
    - The file-bridge limits scope to `project_templates/**`, preventing writes outside the allowed subtree
- Typical setup
    - Start both UI and file-bridge with consolidated logs: `pnpm dev-all` (bridge defaults to `--root $(pwd)`)
    - From the Home page or header, select the repository root (absolute path). For local testing, use this repo’s `app/` directory or another absolute path on disk
    - Click “Initialize project templates” if `project_templates/` is missing; the app (or `pnpm init-project /abs/path`) will create folders:
        - `project_templates/`
        - `project_templates/ui-state/`
        - `project_templates/modules/<module>/XX_Object_Specs/`
- Switching roots
    - Use the Recent roots dropdown to quickly switch the working root
    - The wizard autosaves UI-state to the currently selected root; switching roots will load that root’s UI-state if present
- Constraints
    - The dev file-bridge enables CORS and restricts writes; requests from `http://localhost:5173` are allowed
    - This workflow is local-only and does not push to remote repos; commits remain a separate human action

## Clarifications and MVP Decisions

### Personas and primary users

- Primary target for the PoC: non-technical business SMEs (domain experts).
- Personas
  - Solution Architects
    - Audit the system
    - Apply updates
    - Create new data modules
    - Deploy CDF projects across dev and prod
  - Data Engineers
    - Create Spark SQL transformations
    - Use extractors and write custom extractors
  - Business SMEs
    - Visualize the data model
    - Add data types
    - Define naming schemas
    - Define data validation constraints
  - Stakeholders
    - Visualize data model
    - Review all changes

### MVP scope and constraints

- Local-only application, single user at a time.
- Performance is not a priority for the PoC; focus on local usability.
- KPIs and ROI are out of scope for the PoC; success is whether the app helps
  users fill out and review information efficiently.
- The app performs no authentication and does not connect to any cloud
  provider; there are no outbound network calls in the MVP.
- IdP group source IDs (admin/user) are collected as user input and emitted
  into generated templates only; they are not used for runtime auth.
- Company-specific naming conventions are collected at runtime and written
  into templates (e.g., global naming and ID macros).
- `moduleId`, target `space`, and environment details (`cdf_cluster`,
  `cdf_region`, names) are collected at runtime. They are required fields for
  output generation but do not affect app startup.
- Observability/alerts are removed from the MVP; any observability fields in
  downstream templates are considered optional and are not rendered by the UI
  for this phase.
 - The app is read/write to the local filesystem within the selected project
   root only; all changes are user-reviewed and committed via Git outside the
   app.

### Round-trip persistence and editing workflow

- Source of truth for humans and AI:
  - Root-level `project_templates/` holds templates and UI state.
- `project_templates/00_Solution_Design_Principles.yaml` is project-wide.
- `project_templates/modules/<module>/01_Conceptual_Model.yaml` and
    `.../XX_Object_Specs/*.yaml` are per-module.
- UI state snapshots for rehydration:
  - `project_templates/ui-state/00_solution_design.json` for Tier 00.
  - `project_templates/modules/<module>/ui-state/01_conceptual_model.json` and
    `.../ui-state/xx/*.json` for Tier XX.
- Load precedence in the UI:
  1) If corresponding `ui-state/*.json` exists, load it to prefill.
  2) Else, parse `project_templates/**/*.yaml` to prefill what is parseable.
  3) Else, start with empty forms.
- Save/emit behavior:
- On export, write updated YAML under `project_templates/**` and JSON
    snapshots under the corresponding `ui-state/` paths, plus (optionally for
    demo) generate Toolkit YAML under `cdf-modules/**`.
  - File writes are deterministic to keep diffs minimal.

### Human-in-the-loop experience (Phase 2)

- Show relationships and attributes of the graph model clearly.
- Provide a zoomable view and a per-entity checklist/approval.
- Include a "Preview" that renders an ERD-like diagram of the full scope
  (00 + all 01 + all XX for selected modules). Support zooming and panning
  to navigate large diagrams and focusing on specific entities.
  - Library: Cytoscape.js with ELK layout for auto-layout. Initial scope is
    read-only with zoom/pan, fit-to-screen, and select-to-inspect side panel.

### Validation approach

- Use schema-based validation, but allow logically incorrect inputs to learn
  from user behavior.
- Target a closed test group (fewer than 10 users).

### MVP rationale: template choice

- Start with `00_Solution_Design_Principles.yaml` (Tier 1) because it sets
  project-wide guardrails referenced by Tiers 2 and 3.
- Downstream mapping:
  - Tier 1 → `config.[env].yaml`, access groups, optional RAW
      definitions (demo).
  - Tier 2 → data model definitions.
  - Tier 3 → containers, views, and (demo) transformations.

### Problem statement (why now)

- Accelerate time from zero to a working CDF project for new customers.
- Complex relationships in custom and core models slow implementation.
- Move from asset hierarchy to graph model increases complexity; the UI must
  make it easy.
- Human-readable documentation enables faster knowledge transfer than code.

### External dependencies and non-goals

- AI generation happens in the IDE (Cursor/VS Code) using major LLMs and is
  outside the scope of this UI.
- Errors from the AI service or CI/CD pipelines are out of scope for this PoC.

### Performance and deployment

- Single-user, locally run application for the MVP.

## 7. Templates and Relationships

### 7.1 Templates overview

- [`00_Solution_Design_Principles.yaml`](../../docs/cdf_project/templates/00_Solution_Design_Principles.md):
  project-level guardrails, environments, spaces, security, promotion, and
  global standards.
- [`01_CONCEPTUAL_MODEL_TEMPLATE.yaml`](../../docs/cdf_project/templates/01_CONCEPTUAL_MODEL_TEMPLATE.md):
  module-level domain model: core objects, relationships, and data model.
- [`XX_Object_Specification_Template.yaml`](../../docs/cdf_project/templates/XX_Object_Specification_Template.md):
  implementation details per object: properties, relationships, view/container,
  transformations, and data quality.

### 7.2 Inputs captured by the UI and outputs produced (UI-only; no CDF calls)

- 00 — Solution Design Principles (YAML only)
  - Inputs (examples)
    - Project and module names, business goals, glossary
    - Environments, spaces, RAW systems, promotion rules
    - Access roles and capabilities, global standards, inheritance
    - Integrations
    - ID macros
  - Output of the UI
    - `project_templates/00_Solution_Design_Principles.yaml`
    - `project_templates/ui-state/00_solution_design.json`
- 01 — Conceptual Model (YAML only)
  - Inputs (examples)
    - Core objects with types, view/container IDs, spaces
    - Relationships (type, multiplicity, labels, resolution hints)
    - External references and grouped views into a data model
  - Output of the UI
    - `project_templates/modules/<module>/01_Conceptual_Model.yaml`
    - `project_templates/modules/<module>/ui-state/01_conceptual_model.json`
- XX — Object Specification (YAML only)
  - Inputs (examples)
    - Object metadata and lineage (space, RAW sources)
    - Properties (types, nullability, source fields)
    - Container spec (PK, required, unique, indexes)
    - Relationships, implements/requires
    - Time series, transformations, data quality
  - Output of the UI
    - `project_templates/modules/<module>/XX_Object_Specs/<object>.yaml`
    - `project_templates/modules/<module>/ui-state/xx/<object>.json`

### 7.3 How the templates relate

- Tiered cascade:
  - Tier 1 (00) sets project-wide standards and guardrails.
  - Tier 2 (01) defines the module’s domain model and relationships.
  - Tier 3 (XX) provides object-level implementation details.
- Lifecycle at a glance:
  - Design in templates → AI-assisted cascade → Human review → Generate YAML
      → Deploy → Iterate.
- Template-to-YAML mapping:
  - Tier 1: `config.[env].yaml`, `accessgroups/*.group.yaml`, optional
      `raw/*.database.yaml` for demo RAW.
  - Tier 2: `datamodels/*.model.yaml`.
  - Tier 3: `datamodels/containers/*.container.yaml`,
      `datamodels/views/*.view.yaml`, and demo `transformations/*.yaml`.

## 8. Visuals

### 8.1 End-to-end workflow (demo scope)

```mermaid
flowchart TD
    A[Domain Knowledge<br/>(example_data_model_overview.md)]
        --> B[UI App<br/>Schema-driven Form]
    Z[Zod Data Schema] --> B
    U[UI Schema JSON] --> B

    B --> C[DM YAML<br/>models/containers/views]
    B --> D[Project Config<br/>config.[env].yaml]
    B --> E[Access Groups<br/>accessgroups/*.group.yaml]
    B --> F[RAW Schema<br/>raw/*.database.yaml]
    B --> G[SQL Transformations<br/>transformations/*.yaml]

    C --> H[Git Repo]
    D --> H
    E --> H
    F --> H
    G --> H

    H --> I[Toolkit Deploy<br/>Apply YAML]
    I --> J[(CDF)]

    K[Synthetic CSVs] --> L[Load to RAW]
    L --> J

    G --> M[Run Transformations]
    M --> N[Populate Views<br/>(DM instances)]
    N --> O[Verify via Queries<br/>GraphQL / Instances]

    %% Explicitly note tier completion requirement
    subgraph T[Template Completion]
        T1[Tier 1 — 00] --> T2[Tier 2 — 01]
        T2 --> T3[Tier 3 — XX]
    end
    T3 --> B
```

### 8.2 App inputs and outputs (zoomed in)

```mermaid
flowchart LR
    subgraph App[UI Application (Templates only)]
        Z[Zod Data Schema] --> R[FormRenderer]
        U[UI Schema JSON] --> R
        H[Human Input] --> R

        R --> Y1[Project Templates (YAML requirements)]
        R --> Y2[UI State (JSON)]

        R --> V[Validation Feedback]
    end

    K[Domain Knowledge<br/>Notes, Slides, Docs] --> H

    Y1 --> G[Git Repo / Clipboard]
    Y2 --> G
```

### 8.3 Overall docs-as-code workflow (initial + maintenance)

```mermaid
flowchart TD
    %% Initial generation
    A[Kickoff Workshops<br/>SMEs + Cognite Team] --> B[Unstructured Docs
    <br/>Notes, Slides, Markdown]
    B --> C[UI App<br/>Schema-driven Forms]
    C --> D[Structured Templates<br/>00 / 01 / XX]
    D --> E[AI Assistant (LLM)<br/>With Detailed Prompts]
    E --> F[Generate CDF Repo<br/>Toolkit YAML + Structure (via AI outside UI)]
    F --> G[Git PR / Repo]
    G --> H[CI/CD<br/>Toolkit Deploy]
    H --> I[(CDF Project)]

    %% Human review of AI outputs
    G --> R[Human Review<br/>Diffs / Approve]
    R --> H

    %% Maintenance loop
    J[New / Changed Requirements] --> K[Read Existing Templates]
    K --> C
    C --> L[Updated Templates]
    L --> E
    E --> M[Update Repo Files]
    M --> G
```

## 9. Distribution and Installation (MVP testing)

### Goals

- Zero backend; local-first.
- Easy for non-developers to run.
- Deterministic builds; reproducible across macOS/Windows/Linux.

### Options considered

1) Packaged desktop app (Tauri) producing a single binary
   - Pros: no Node required at runtime; native file dialogs; sandboxed FS
   - Cons: signing/notarization effort; per-OS builds
2) Local static web app + tiny file-bridge
   - Pros: simplest; works anywhere; easy contribution model
   - Cons: requires Node for dev; file-bridge binary for seamless FS writes
3) Pure static web app (download/open index.html)
   - Pros: minimal footprint
   - Cons: manual import/export flows; no direct FS writes

### Decision (Phase 1 MVP)

- Web-first delivery using a static web app served locally plus a tiny
  file-bridge process for safe filesystem writes constrained to the selected
  repo root under `project_templates/**`.
- Desktop packaging with Tauri is deferred to Phase 2 and will be reconsidered
  if broader distribution or native OS integration is needed.

### Install flows

- Web app (Phase 1):
  - Prereq: Node 20 LTS and pnpm (for dev/test); for testers, provide a
    prebuilt `dist/` and a minimal static server command or open `index.html`.
  - Start the `file-bridge` binary with `--root <repo_root>`; the app connects
    to it on localhost to perform constrained reads/writes.

### 9.1 Distribution (MVP)

- Audience: ~3 internal testers.
- No OS code signing required. Distribute the static `dist/` folder and a small
  `file-bridge` binary. macOS and Windows will not prompt for app signing
  because we are not installing a native app in Phase 1.

## 10. YAML formatting assumptions (for requirements templates)

- File type: UTF-8 with Unix newlines; single trailing newline; no BOM.
- Indentation: two spaces for YAML nesting; four spaces for nested list items in Markdown within YAML strings when present.
- Keys: lowerCamelCase for object fields; snake_case for IDs where called out
  (e.g., `moduleId` vs `object_id`).
- Stable ordering: deterministic key order on emit (top-level then logical groups)
  to minimize diffs.
- Scalars: quote only when needed (spaces, special chars); ISO 8601 UTC for times.
- Enums: constrained to allowed values defined by Zod schemas; validation errors
  block export.
- Comments: top-of-file header allowed; inline YAML comments avoided in emitted files to keep round-trip parsing simple.

### 10.1 Identifier naming and validation (UI-enforced)

- `moduleId` (snake_case): `^[a-z0-9]+(?:_[a-z0-9]+)*$`
- `objectId` (lowerCamelCase): `^[a-z][a-zA-Z0-9]*$`
- `space.externalId` (DM space IDs): `^[a-z0-9_\-:.]+$`
  - Recommendation: prefix spaces with `sp_`, for example `sp_opc_assets`.
- External IDs (`viewExternalId`, `containerExternalId`, etc.):
  `^[a-z0-9:_-]+$`

These constraints are reflected in the JSON Schemas and Zod schemas used
by the UI. Fields violating patterns surface inline validation errors.

## 11. File-bridge assumptions (web app)

- A small local helper provides file system access for the static web app.
- Invocation: `file-bridge --root <repo_root> --allow project_templates`.
- Scope: read/write limited to the selected `--root` and the `project_templates/**`
  subtree; attempts outside are rejected.
- Transport: localhost HTTP on a random high port; no external network access.
- Auth: none; single-user, local-only; process lifetime scoped to the app session.
- macOS distribution: prebuilt universal binary; no installer, runs from CLI.
- Security: no file execution, only read/write/create; path traversal sanitized.

### 11.1 CLI and API spec (MVP)

- Language/runtime: Rust.
- CLI:
  - `file-bridge --root <repo_root> --allow project_templates --port <int>`
- Endpoints:
  - `GET /v1/health` → `200 OK { "status": "ok" }`
  - `GET /v1/read?path=<relative>` → returns file contents
  - `POST /v1/write { path, content }` → atomic write; creates parents
  - `POST /v1/mkdirp { path }` → create directories as needed
- Constraints:
  - All `path` values are resolved under `--root` and must be within
    the `--allow` subtree (`project_templates/**`).
  - Atomic write via temp file + rename; UTF-8; ends with newline.
  - Rejects traversal and writes outside the allowed subtree.

### End-user quick start and troubleshooting

Where to put it
- The app can be placed anywhere (e.g., `/Applications`); its location does not
  matter. On first run, select the repository root that should contain
  `project_templates/`.
- Do not select `cdf-modules/` as the project root.

Expected layout after first run
- `project_templates/00_Solution_Design_Principles.yaml`
- `project_templates/ui-state/00_solution_design.json`
- `project_templates/modules/<module>/01_Conceptual_Model.yaml`
- `project_templates/modules/<module>/XX_Object_Specs/<object>.yaml`
- `project_templates/modules/<module>/ui-state/...`

Common mistakes and fixes
- Wrong project root selected
  - Symptom: `project_templates/` appears under `cdf-modules/`.
  - Fix: Re-open the app and select the repository root; move
    `project_templates/` to the repo root.
- Placing the app inside `cdf-modules/`
  - Impact: Only problematic if you also select that folder as root.
  - Fix: Keep the app anywhere; always select the repo root.
- No write permissions
  - Symptom: Save/export fails.
  - Fix: Ensure folder permissions; grant access on macOS when prompted.
- Missing `project_templates/`
  - Symptom: App shows initial generation.
  - Fix: Let the app create it automatically at the repo root.
- UI-state not loading
  - Symptom: Forms empty on reopen.
  - Fix: Check `project_templates/ui-state/*.json` exist; the app loads UI-state
    first, then falls back to parsing Markdown.
- Manual YAML edits break parsing
  - Symptom: Import errors/missing fields.
  - Fix: Use the app to regenerate the file, then carefully re-apply edits.
- File-bridge run from wrong directory
  - Symptom: `project_templates/` created in the wrong place.
  - Fix: Run `file-bridge` from the repo root or pass `--root /path/to/repo`.

### Plugging into an existing CDF repo

- Run the app alongside the target repo; on first run, select the repo root.
- The app reads/writes `project_templates/**`. If absent, it initializes it.
- The app does not alter CI/CD or commit changes; users review and commit via
  Git. AI/Toolkit steps remain separate per the workflow.

## 12. Confirmed MVP decisions and assumptions

- CDM/Graph-only semantics across templates and examples. Use Data Modeling
  Graph (instances, views, spaces, typed edges); avoid classical asset
  hierarchy.
- Web-first: Phase 1 delivers a static web app + local file-bridge. Desktop
  packaging with Tauri is deferred to Phase 2.
- Atomic writes: write via temp file + rename; create parent folders as needed.
- Schema versioning: every emitted YAML and UI-state JSON includes
  `schemaVersion` to enable future migrations.
- No outbound network: local-only, except an optional local file-bridge in
  Phase 2.

Additional clarifications (confirmed):

- Custom domain types are first-class. Objects can implement core views
  like `CogniteAsset` and `CogniteEquipment` while adding domain-specific
  properties in their own containers and views.
- Relationships include both `direct` and typed `edge` relations. Edge
  requirements: `edgeSpace`, `edgeTypeExternalId`, optional `label`, and
  declared `multiplicity`. Mapping to Toolkit YAML happens downstream.

### Definition of Done (MVP)

- Tier 00/01/XX forms validate and emit canonical YAML and UI-state JSON.
- Round-trip load works from both UI-state JSON and YAML deterministically.
- Web app runs locally on macOS Apple-silicon for internal testers using a
  static site and local file-bridge.
- For the demo: sample Toolkit YAML generated (outside the UI), RAW data
  loaded, SQL transformations executed, and instances verified via Graph/DM.
- Distribution: unsigned dev builds packaged for easy internal sharing plus a
  short operator README. Formal signing and notarization are out of scope for
  Phase 1 and will be considered in a later phase.

Last updated: 2025-08-08


