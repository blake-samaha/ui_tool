## Refactoring Plan for Docs-as-Code UI PoC

This document outlines a concrete, step-by-step plan to simplify, organize, and refactor the local-only PoC into a maintainable foundation for future development. Focus is on developer experience, clarity, and modularity (not production security or scalability).

### Directory Structure Overhaul (highest priority)

- **What**: The monorepo is nested under `app/`, creating unnecessary depth and duplicated tooling. There are empty folders and committed build artifacts (`dist/`, `*.tsbuildinfo`, nested `pnpm-lock.yaml`).
- **Why**: Extra depth slows navigation and increases config friction. Empty folders mislead developers. Committed artifacts reduce signal-to-noise and cause merge pain. A flatter, feature-based layout improves discoverability and change velocity.
- **How**

Before (selected)
```text
/(repo)
  gpt5_prompt.md
  UAT.md
  node_modules/
  ui_tool/
    app/
      package.json
      pnpm-workspace.yaml
      tsconfig.json
      tsconfig.base.json
      cdf.toml
      README.md
      docs/
      schema/
      scripts/
      project_templates/
      data/                 # sample CSVs (unused by app)
      packages/
        file-bridge-client/
        form-renderer/
        shared-types/
        ui-application/
          e2e/              # empty
          scripts/          # empty
          src/
            app/
            assets/
            components/common/
            features/...
            forms/
              data-schemas/
                tier00/
                tier01/     # empty
                tierXX/     # empty
              registry/
              ui-schemas/
            hooks/          # empty
            lib/            # empty
            routing/        # empty
            services/
            state/
            styles/
            test/
            types/
            utils/
            views/
          pnpm-lock.yaml    # redundant lockfile inside a workspace pkg
        ui-components/
          src/feedback/     # empty
        yaml-emitter/
```

After (proposed)
```text
/(repo root)
  package.json
  pnpm-workspace.yaml
  tsconfig.json
  tsconfig.base.json
  .gitignore
  README.md
  docs/
    UAT.md
    gpt5_prompt.md
    wizard_requirements.md
    feature_phase_2_modeling.md
    feature_phase_3_entity_design.md
    step_by_step_walkthrough.md
    requirements/                # moved from app/requirements/*
  schema/
    config_env.schema.json
    README.md
  scripts/
    dev-file-bridge.js
    dev-runner.js
    init-project.js
    migrate-modules.js
    smoke-test.js
  examples/
    project_templates/           # optional example tree
    sample-data/                 # optional CSV samples or delete
  packages/
    ui-app/                      # rename from ui-application
      public/
      src/
        app/                     # App.tsx, router
        components/
          common/
        features/
          tier00/
            components/
            hooks/
            services/
            forms/
          tier01/
            components/
            hooks/
            services/
            forms/
        services/
          file-bridge/
          toolkit/
            buildConfig.ts
            validateConfig.ts
            repoInit.ts
            resolveCdf.ts
            modules.ts
          yaml/
          io/
        state/
        styles/
        types/
        utils/
        views/
      tests/
      vite.config.ts
      vitest.config.ts
      tsconfig.json
    file-bridge-client/
    form-renderer/
    shared-types/
    ui-components/
    yaml-emitter/
```

Actions
- Flatten monorepo: move `app/package.json` → `/package.json`, `app/pnpm-workspace.yaml` → `/pnpm-workspace.yaml`, `app/tsconfig*.json` → `/`, `app/README.md` → `/README.md`.
- Move `app/packages/*` → `/packages/*`; move `app/docs`, `app/schema`, `app/scripts` to root equivalents.
- Delete `app/cdf.toml` (the app creates/patches it in the user-selected repo).
- Move `app/project_templates/` to `/examples/project_templates/` or remove.
- Delete `app/data/` or move to `/examples/sample-data/` (unused by the UI).
- Normalize `packages/ui-application`: rename to `packages/ui-app`; remove empty folders; remove nested `pnpm-lock.yaml`.
- Add `.gitignore` entries for artifacts: `node_modules/`, `packages/**/dist/`, `**/*.tsbuildinfo`.
- Update aliases and scripts: fix `vite.config.ts` and `tsconfig.json` paths after rename.

Notes on `./app`
- Remove the wrapper directory. It provides no functional isolation and adds noise and duplicated configuration.

### Code Pruning & Cleanup

- **What**: Unused code, build output, empty directories, and stray lockfiles inflate maintenance cost and mask real issues.
- **Why**: Dead code increases cognitive load and breaks confidence during refactors. Artifacts and placeholders cause merge conflicts and slow reviews.
- **How**

Process
1) Remove artifacts and placeholders first
   - Delete all `packages/**/dist/`, `**/*.tsbuildinfo`, and nested `pnpm-lock.yaml` inside packages.
   - Delete empty folders found: `packages/ui-application/src/hooks`, `src/lib`, `src/routing`, `e2e`, `scripts`, `packages/ui-components/src/feedback`, `forms/data-schemas/tier01`, `forms/data-schemas/tierXX`.
   - Delete `app/data/` or move to `/examples/sample-data/`.
   - Delete or move `project_templates/` to `/examples/` (not required at runtime).
2) Turn on strict surfacing of unused symbols
   - TypeScript (root tsconfig)
```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true
  }
}
```
   - ESLint rules
```json
{
  "rules": {
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": ["warn", { "args": "after-used", "ignoreRestSiblings": true }]
  }
}
```
3) Detect unused files/exports and dependencies
   - Unused exports/files: `pnpm dlx knip --workspace --no-gitignore --ignore "packages/**/dist/**"` (or `pnpm -r dlx ts-prune`).
   - Unused dependencies: `pnpm -r dlx depcheck --skip-missing=true`.
   - Duplicates: `pnpm dlx jscpd --languages ts,tsx --reporters consoleFull --threshold 1 --ignore "packages/**/dist/**"`.
4) Fix and remove
   - Remove flagged files/exports not referenced; prefer utilities/hooks/components over duplication.
   - Re-run: `pnpm -r typecheck && pnpm -r lint` until green.
5) Sanity checks
   - Circular deps: `pnpm -r dlx madge --circular src` per package.
   - Bundle analysis (optional): `rollup-plugin-visualizer` in `ui-app`.

### Abstraction & Refactoring (DRY)

- **What**: Logic and UI are mixed (e.g., `Header` in `App.tsx`), and `services/toolkit.ts` handles multiple responsibilities.
- **Why**: Mixed concerns make testing and changes brittle. Splitting logic improves readability, reusability, and respects the 300‑line/file cap.
- **How**

Identify duplication
- Use `jscpd` to surface repeated fragments across `components/wizard`, `services/*`, and `utils/*`.
- Grep for common patterns (e.g., localStorage recent roots, click‑outside handlers, YAML read/write wrappers) and centralize them.

Refactor patterns
- Presentational components vs hooks
  - Move non‑visual logic to custom hooks; keep components pure and memoizable.
  - Extract from `App.tsx`:
    - `useRecentRoots()` for localStorage‑backed recent roots
    - `useFileBridgeHealth(baseUrl)` to track `ok/error/unknown`
    - `useProjectRootSync(client, projectRoot)` to call `client.setRoot`
    - `useClickOutside(ref, onClose)` and `useKey('Escape', onClose)` utilities
  - Wrap presentational UI in `React.memo`; pass stable handlers via `useCallback`.
- Domain‑oriented services
  - Split `services/toolkit.ts` into focused modules:
    - `toolkit/repoInit.ts`, `toolkit/resolveCdf.ts`, `toolkit/scanRepo.ts`, `toolkit/buildConfig.ts`, `toolkit/validateConfig.ts`, `toolkit/modules.ts`.
  - Keep IO helpers under `services/io/`.
- Feature co‑location
  - Move feature‑specific forms/services/components under `features/tier00` and `features/tier01` to reduce cross‑feature coupling.
  - Remove or clearly mark TierXX as experimental: it’s not routed; either delete now or gate with a flag and skip tests.
- Schema strategy
  - Prefer unified single‑file model design with `ModelDesignZ` from `@docs-as-code/shared-types`.
- Guard rails (enforced)
  - ≤300 lines per file; ≤60 lines per function; explicit props and named exports; feature barrel files for imports.

Recommended workspace scripts
```json
{
  "scripts": {
    "dev": "pnpm --filter ui-app dev",
    "preview": "pnpm --filter ui-app preview",
    "build": "pnpm -r build",
    "typecheck": "tsc -b --pretty false",
    "lint": "eslint . --ext .ts,.tsx,.js,.cjs,.mjs",
    "format": "prettier --write .",
    "clean": "rimraf .turbo node_modules packages/*/node_modules packages/*/dist",
    "dev-bridge": "node scripts/dev-file-bridge.js --root $(pwd) --port 45678",
    "dev-all": "node scripts/dev-runner.js --root $(pwd) --port 45678",
    "depcheck": "pnpm -r dlx depcheck --skip-missing",
    "ts-prune": "pnpm -r dlx ts-prune",
    "jscpd": "pnpm dlx jscpd --languages ts,tsx --reporters consoleFull --threshold 1 --ignore \"packages/**/dist/**\"",
    "madge": "pnpm -r dlx madge --circular src"
  }
}
```

Candidate removals now
- Entirely unused by app: `app/data/` (CSV samples).
- Empty directories: `packages/ui-application/src/hooks`, `src/lib`, `src/routing`, `e2e`, `scripts`, `packages/ui-components/src/feedback`, `forms/data-schemas/tier01`, `forms/data-schemas/tierXX`.
- Artifacts: `packages/**/dist/`, `packages/**/tsconfig.tsbuildinfo`.
- Redundant lockfiles: `packages/ui-application/pnpm-lock.yaml`.
- Repo-local examples: move `project_templates/` to `/examples/project_templates/` or remove.
- Optional: move `gpt5_prompt.md` and `UAT.md` to `/docs/`.

Status
- Plan validated against current code: local-only app, pnpm monorepo under `app/`, Vite/React app in `packages/ui-application`, shared workspaces (`file-bridge-client`, `form-renderer`, `shared-types`, `ui-components`, `yaml-emitter`). The steps above flatten the repo, prune dead code, and introduce focused refactors with automated safeguards.



