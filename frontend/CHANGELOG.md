# Changelog — Frontend

All notable changes to the frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry has a unique ID `[XXXX]` for easy reference in PRs and discussions.

---

## [Unreleased]

### Added

- `[b3n7]` Modular importer system — self-contained modules under `src/modules/importers/`, each with its own component, service and definition
- `[c5p2]` CSV importer module with drag & drop upload, row preview and import confirmation (`CsvImporter.vue`)
- `[d8q4]` `ImporterSelector` component — card grid to choose between available import formats
- `[e1r9]` Transactions view updated with Import toggle and empty state

---

## [0.1.0] - 2026-03-07

### Added

- `[a3f2]` Vue 3 + Vite project scaffolded with bun as package manager ([#1](https://github.com/barcam-j/finity/pull/1))
- `[b7c1]` Vue Router with navigation guard — unauthenticated users redirected to `/login` ([#1](https://github.com/barcam-j/finity/pull/1))
- `[d4e9]` Pinia stores: `auth`, `transactions`, `ai` ([#1](https://github.com/barcam-j/finity/pull/1))
- `[f1a6]` HTTP service layer: `api.js` (base client with JWT header), `auth.js`, `transactions.js` ([#1](https://github.com/barcam-j/finity/pull/1))
- `[c8b3]` Login and register form in a single view with toggle between modes
- `[e2d7]` `AppLayout` component with sidebar navigation and sign out button
- `[g5f4]` Light / dark / system theme switcher — persisted in `localStorage`, applied via `data-theme` on `<html>` ([#3](https://github.com/barcam-j/finity/pull/3))
- `[h9a2]` Orange accent color (`oklch(0.70 0.19 42)`) for active nav links, buttons and input focus ([#3](https://github.com/barcam-j/finity/pull/3))
- `[i3c8]` CSS architecture with OKLCH colors separated into layers ([#5](https://github.com/barcam-j/finity/pull/5)):
  - `primitives.css` — raw color palette
  - `themes/light.css` and `themes/dark.css` — semantic tokens
  - `base.css` — reset and typography
  - `main.css` — entry point
- `[j6b5]` Prettier configured with single quotes, no semicolons, 2 spaces, print width 100 ([#6](https://github.com/barcam-j/finity/pull/6))

### Fixed

- `[a1t3]` Vite downgraded to `5.x` for Node.js 21 compatibility

[Unreleased]: https://github.com/barcam-j/finity/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/barcam-j/finity/releases/tag/v0.1.0
