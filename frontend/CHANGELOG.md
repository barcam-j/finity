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
- `[b4c8]` Multi-language support (English, Spanish, Italian) — `vue-i18n` v9 integration; all UI strings extracted to locale files under `src/locales/`; language preference persisted via `GET/PUT /preferences/`; language selector added to Settings → General with auto-save on change (no Save button required)
- `[c2d4]` AI analysis responds in the user's configured language — `language` field added to `UserPreferences`; backend passes it to the AI prompt; cache key includes language to avoid serving stale translations
- `[e6f8]` Locale flash on reload eliminated — locale resolved from `localStorage` before app mounts; browser language auto-detected for new users via `navigator.language`
- `[g1h5]` Importer format cards translated — `ImporterDefinition` type uses `labelKey`/`descriptionKey` instead of static strings; `ImporterSelector` resolves labels at render time via `t()`
- `[i7j3]` Native pluralization for bulk-delete confirmation — replaced manual `{suffix}` workaround with vue-i18n pipe syntax (`singular | plural`) across all three locale files
- `[k9l2]` Dashboard period label and dates rendered in active locale — replaced backend-generated English month name with `Intl.DateTimeFormat` using the reactive `locale` ref; changes apply immediately on language switch
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

- `[o5k3]` Transaction row selection with per-row checkboxes and select-all header checkbox (indeterminate state supported)
- `[p7l6]` Inline editing for date, description and categories directly in the transaction table — click any cell to edit, Enter/Esc to confirm/cancel
- `[q2m8]` Multi-category support per transaction — tag editor with datalist autocomplete, add via Enter, remove via × chip button
- `[r4n1]` Category badges on each row with hover-to-remove animation (smooth `max-width` + opacity transition)
- `[s6o5]` `BulkEditBar` component — appears when rows are selected; add category to all selected, delete selected, close panel; animated slide-in via JS height transition
- `[t9p2]` Bulk action buttons converted to icons (checkmark for apply, trash for delete, ✕ for close) for a cleaner, icon-consistent toolbar
- `[u1q7]` Categories displayed with `text-transform: capitalize` and reduced font size across table and bulk bar

- `[x7t5]` Transaction filters bar — search by description (debounced), multi-select category dropdown, date range and amount range; all filters combined and sent to backend on every change
- `[y2u8]` Smooth row enter/leave/move transitions on transaction table repaint using `<TransitionGroup>`
- `[z4v1]` Confirmation dialog before bulk delete — shows count of affected transactions, animated backdrop with scale transition; reusable `ConfirmDialog` component via `<Teleport>`
- `[a5w2]` `lucide-vue-next` installed as icon library — replaced all inline hardcoded SVGs (`Search`, `ChevronDown`, `X`, `Check`, `Trash2`) in `TransactionFilters` and `BulkEditBar` — shows count of affected transactions, animated backdrop with scale transition; reusable `ConfirmDialog` component via `<Teleport>`

- `[a1c2]` Unit test infrastructure — Vitest 2 + Vue Test Utils + happy-dom configured in `vite.config.ts`; `test` and `test:coverage` scripts added to `package.json`; `vitest/globals` types added to `tsconfig.app.json`
- `[b3d4]` Unit tests for `parseDate` / `parseAmount` CSV utilities — 26 cases covering date format variants, amount separators, edge cases and invalid inputs
- `[c5e6]` Unit tests for `useCurrency` composable — 9 cases covering symbol position, decimals parameter, EUR/GBP/JPY formatting
- `[d7f8]` Unit tests for `useSavedFeedback` composable — 4 cases with fake timers covering show/hide lifecycle
- `[e9g1]` Unit tests for `transactions` store — 8 cases for `updateTransaction` and `bulkUpdateCategory` with mocked service
- `[f2h3]` Unit tests for `auth` store — 11 cases for `isAuthenticated`, `login` and `logout`
- `[g4i5]` Unit tests for `dashboard` store — 12 cases for `fetchAvailableMonths`, `fetchKpis` and `fetchAnalysis`
- `[h6j7]` Unit tests for `api` service — 8 cases including 401 auto-logout and redirect
- `[i8k9]` Unit tests for `i18n` locale resolution — 8 cases covering stored preference, browser language detection and fallback to `en`
- `[j1l2]` Unit tests for `ApiError` class — 4 cases covering message and status code
- `[k3m4]` `DashboardKpis` — Investments KPI card replacing Top Category; balance shows real balance (excluding investments) with secondary subtitle showing balance-with-investments
- `[l5n6]` `KpiCard` — `clickable` prop with hover accent border and pointer cursor
- `[m7o8]` KPI amounts rounded to 0 decimals — `formatAmount(value, 0)` applied to all dashboard indicators
- `[n9p1]` Currency amounts use locale-aware decimal/thousand separators — `useCurrency` now reads `i18n.global.locale.value` instead of hardcoded `en-US`
- `[o2q3]` Click on Expenses KPI navigates to Transactions filtered by `amount_max=-0.01` and active period date range
- `[p4r5]` Click on Investments KPI navigates to Transactions filtered by `categories=inversión` and active period date range
- `[q6s7]` Click on Income KPI navigates to Transactions filtered by `amount_min=0.01` and active period date range
- `[r8t9]` `TransactionFilters` accepts `initialFilters` prop — refs initialized from prop so filters pre-populate when navigating from dashboard KPI cards
- `[s1u2]` `TransactionsView` reads route query params on mount (`amount_max`, `amount_min`, `date_from`, `date_to`, `search`, `categories`) and passes them as initial filters
- `[t3v4]` Deduplication feature — "Remove duplicates" button in Transactions view triggers `POST /transactions/deduplicate`; shows count of removed rows; confirmation dialog before executing
- `[u6v8]` Transaction dates formatted according to active locale using `toLocaleDateString` — reactive to language changes
- `[v9w1]` Auto-categorization on category assign — when a category is added to a transaction, all other transactions with a matching description signature are auto-categorized; notice shown for 4 seconds with count
- `[w2x4]` Auto-categorization on import — CSV and PDF importers apply learned rules to newly imported transactions immediately after insert
- `[x5y7]` Category normalization — accent and case insensitive duplicate prevention in `TransactionRow`, `BulkEditBar` and backend; `_cat_key()` helper normalizes via NFKD + lowercase
- `[y8z1]` Persistent categorization rules — `CategoryRule` model stored in MongoDB; rules saved automatically on manual category assignment; visible and deletable in Settings → Auto-categorization rules section
- `[z2a4]` Transaction date editing locked by default — new toggle in Settings → General ("Allow editing transaction dates"); disabled by default; `TransactionRow` checks `prefs.allowDateEdit` before opening date editor
- `[a5b7]` `investment_categories` added to dashboard KPIs response — Investments KPI navigates with actual stored category names instead of hardcoded `inversión`
- `[b8c1]` Transactions view shows "no results" message when filters return empty — filters bar stays visible; `TransactionsEmptyState` only shown when no transactions exist at all
- `[c2d5]` Category deduplication migration script (`scripts/merge_duplicate_categories.py`) — groups variants by normalized key, picks most-used as canonical, asks confirmation per user before applying

- `[d4e6]` `SettingsView` reorganised into tabbed navigation — four tabs: General, AI Provider, Categorization, Account; `SettingsSection` title removed (tab label serves as heading); `SettingsSection` title prop dropped entirely
- `[e7f1]` Account tab in Settings — displays user email and a three-way theme selector (Light / Dark / System) replacing the sidebar cycle button; `themeStore.set(value)` added to theme store
- `[f9g4]` Data tab in Settings — Export CSV button downloads all transactions; import history table shows date, bank/entity name, source badge and transaction count; danger zone with confirmed "Delete all data" action
- `[g2h7]` Bank/entity name field in CSV and PDF importers — optional text input shown at the preview step before confirming import; value stored in `ImportLog` and displayed in the import history table
- `[h4i9]` API key reveal in Settings — "Show" button fetches and displays the stored key when the field is empty; "✓ Configured" badge shown next to the label; placeholder updated to clarify a new key replaces the current one

### Fixed

- `[u5w6]` Pagination showing duplicate rows across pages — secondary sort by `_id ASC` added after `date DESC` to guarantee stable ordering when multiple transactions share the same date
- `[v3r4]` Transaction `id` field was not reaching the frontend — Beanie serialized it as `_id` (alias) via `jsonable_encoder`; fixed with `model_dump(mode='json', by_alias=False)` in all transaction endpoints
- `[w5s9]` Select-all triggered on single row click — `indeterminate` DOM property set via `watchEffect` could fire a spurious `change` event in Chrome; fixed by switching header checkbox to `@click.prevent` so only explicit user clicks trigger the handler

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
