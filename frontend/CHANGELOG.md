# Changelog — Frontend

All notable changes to the frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry has a unique ID `[XXXX]` for easy reference in PRs and discussions.

---

## [Unreleased]

### Added

- `[m3c1]` Currency preference in Settings — user selects their currency (EUR, USD, GBP and 7 more); persisted via `GET/PUT /preferences/`
- `[n5d7]` `useCurrency` composable — centralised `formatAmount` using stored currency with symbol always placed after the number (e.g. `45.30 €`)
- `[o8e2]` Paginated transaction list in Transactions view with per-row delete, sorted by date descending
- `[p2f6]` CSV importer preview paginated (20 rows/page) with per-row delete to curate transactions before confirming import

- `[f2s1]` Settings view with AI provider configuration form — provider selector, model field with datalist suggestions, API key input with show/hide toggle
- `[g4t6]` Step-by-step API key guides for Gemini, Anthropic, OpenAI and xAI (Grok) — shown contextually when each provider is selected
- `[h7u2]` Gemini pre-selected as default provider with `gemini/gemini-2.0-flash` as default model
- `[i9v8]` Provider models fetched from backend on provider select — shows real available models with "Loading models…" feedback
- `[j1w4]` `AiBanner` component — warns user when no AI provider is configured, with direct links to Google AI Studio and Settings. Shown in Transactions view and CSV importer. Dismissable per session
- `[k3x9]` Friendly error messages in CSV importer for AI provider failures (rate limit, invalid key, model not found)
- `[l6y3]` `ai-config` service and completed `ai` store with `fetchConfig` and `saveConfig` actions

- `[b3n7]` Modular importer system — self-contained modules under `src/modules/importers/`, each with its own component, service and definition
- `[c5p2]` CSV importer module with drag & drop upload, row preview and import confirmation (`CsvImporter.vue`)
- `[d8q4]` `ImporterSelector` component — card grid to choose between available import formats
- `[e1r9]` Transactions view updated with Import toggle and empty state

- `[q1a2]` PDF importer module (`src/modules/importers/pdf/`) — same flow as CSV, AI extracts transactions from bank statement PDFs; `source='pdf'` tagging
- `[r3b8]` CSV importer method selector — user chooses between AI import (any format) or Manual import (no API key required) before uploading
- `[s5c4]` Manual CSV import — column mapping step with date column, date format, amount column, amount format (period/comma), description and category selectors; frontend applies mapping and generates transaction preview
- `[t7d1]` CSV and Excel support — importer accepts `.csv`, `.xlsx` and `.xls`; SheetJS converts Excel to CSV on the frontend before sending to backend; all sheets are merged (headers taken from first sheet)
- `[u2e6]` CSV structure validation feedback — clear error shown when file has only one column or rows are not properly delimited
- `[v4f3]` TypeScript migration — all source files converted from JavaScript to TypeScript; strict mode enabled; shared types centralised in `src/types/index.ts`; custom `ApiError` class with typed `status` field; all Vue components use `<script setup lang="ts">`
- `[w6g8]` Auto-logout on expired session — any `401` response from the API clears the token and redirects to `/login`
- `[x9i4]` `TransactionsView` atomized into four components under `src/components/transactions/`: `TransactionRow`, `TransactionTable`, `TransactionPagination`, `TransactionsEmptyState`
- `[y3j7]` `SettingsView` atomized into three components under `src/components/settings/`: `SettingsSection` (slot-based section wrapper), `ProviderGuide` (per-provider API key instructions), `ApiKeyField` (password input with show/hide toggle)
- `[z1k2]` Extracted `CURRENCIES` and `AI_PROVIDERS` constants to `src/constants/`; extracted `useSavedFeedback`, `useCurrencyForm` and `useAiProviderForm` composables to `src/composables/`
- `[a1b3]` Centralised shared form styles into `src/styles/forms.css` — eliminates CSS duplication across settings components

- `[f6a1]` Dashboard view with KPI overview (balance, income, expenses, top category) and AI analysis panel
- `[g8b4]` `KpiCard` and `DashboardKpis` components under `src/components/dashboard/` — KPI grid with month navigator (`‹ Month YYYY ›`) and All time toggle
- `[h2c7]` `AiAnalysisPanel` component — always shows basic spending summary and category breakdown; AI-generated text shown above when enabled
- `[i5d3]` Month navigation in dashboard — browse all months with recorded transactions via prev/next arrows; defaults to most recent month
- `[j9e6]` Period metadata line under KPIs — shows active month name and last import date derived from MongoDB ObjectId timestamp
- `[k1f2]` `dashboard` Pinia store with `fetchKpis`, `fetchAnalysis`, `fetchAvailableMonths` actions
- `[l4g8]` `dashboard` service — `getKpis`, `getAnalysis`, `getAvailableMonths` API calls
- `[m7h5]` AI analysis toggle auto-saves immediately on click via `PATCH /ai-config/analysis-enabled` — no need to press Save
- `[n3i1]` Enabling AI auto-activates when API key is entered in the form — toggle turns on as soon as a key is typed

### Fixed

- `[b2c4]` AI provider loading spinner never showed on settings page — replaced broken `aiLoading && !form.provider` condition with dedicated `initializing` ref
- `[c3d5]` Saved AI model overwritten on page load — `onProviderChange` reset the model before the saved value could be restored; now preserved via `savedModel` after models are fetched
- `[d4e6]` Currency save button showed "Saving…" during initial data fetch — `saving` ref now tracks only the save operation, separate from the fetch
- `[e5f7]` Calling `onProviderChange` with empty provider triggered a spurious API call — guarded with early return when provider is blank
- `[o6j9]` AI config save used stale local state after PUT — store now re-fetches config from backend after saving

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
