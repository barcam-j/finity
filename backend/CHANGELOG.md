# Changelog — Backend

All notable changes to the backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry has a unique ID `[XXXX]` for easy reference in PRs and discussions.

---

## [Unreleased]

### Added

- `[c4g3]` `UserPreferences` model and `GET/PUT /preferences/` router — stores per-user settings (currency, default `EUR`)
- `[d6h9]` `GET /transactions/` now supports pagination via `?page` and `?limit` query params, returns `{ items, total, page, pages }` sorted by date descending

- `[x2a5]` `GET /ai-config/models/{provider}` endpoint — returns real models fetched from provider API using stored user key, with 1-hour in-memory cache; falls back to defaults if key unavailable or request fails
- `[y4b1]` `app/ai/models.py` — provider model fetcher supporting OpenAI-compatible APIs (OpenAI, Mistral, Groq, xAI), Gemini and Ollama
- `[z6c7]` `PUT /ai-config/` accepts optional `api_key` — omitting it on update preserves the existing encrypted key
- `[a8d3]` xAI (Grok) added as supported provider with models `xai/grok-2` and `xai/grok-2-mini`
- `[b1e9]` Improved AI error handling in CSV importer — rate limit (429), authentication (401) and model not found (404) mapped to user-friendly messages

- `[u7n3]` Modular importer architecture — `ImporterBase` ABC, registry with `register_importers()`, importers mounted under `/importers/<type>`
- `[v1o8]` CSV importer module (`app/importers/csv/`) with improved column detection (EN/ES aliases), `source='csv'` tagging on each transaction
- `[w4p2]` Removed old `POST /transactions/import` endpoint — CSV import now served exclusively from `POST /importers/csv/import`

- `[e3f1]` PDF importer module (`app/importers/pdf/`) — `POST /importers/pdf/preview` extracts text via `pypdf` and sends to AI; `POST /importers/pdf/import` saves transactions with `source='pdf'`; `pypdf==5.4.0` added to dependencies
- `[f5g7]` `POST /importers/csv/parse` endpoint — reads and decodes CSV without AI, returns headers, all rows and `has_header_warning` flag for the manual import flow
- `[g8h2]` CSV validators extracted to `app/importers/csv/validators.py` as FastAPI dependencies (`get_csv_text`, `get_parsed_csv`) — validates file is not empty, has multiple columns and rows are properly delimited; injected via `Depends` keeping router handlers clean

- `[h1i4]` `GET /dashboard/kpis?period=` endpoint — supports `month` (most recent recorded month), `all` and specific `YYYY-MM`; returns income, expenses, balance, top category, transaction count, spending by category (top 5), period label and last import date
- `[i3j7]` `GET /dashboard/analysis?month=YYYY-MM` endpoint — returns AI-generated analysis for the given month; requires `analysis_enabled` flag on user's AI config
- `[j5k2]` `GET /dashboard/months` endpoint — returns sorted list of distinct months (`YYYY-MM`) that have transactions for the current user
- `[k8l6]` `AnalysisCache` model and collection — caches AI analysis per user per month; invalidated automatically when transactions for that month change (MD5 hash of transaction IDs)
- `[l2m9]` `analysis_enabled` flag added to `AiConfig` model — controls whether AI analysis runs on the dashboard
- `[m4n3]` `PATCH /ai-config/analysis-enabled` endpoint — toggles AI analysis flag independently of the full config save
- `[n7o5]` Auto-enable `analysis_enabled` when an API key is provided on `PUT /ai-config/` — first-time setup and key rotation both activate analysis automatically
- `[o1p8]` Investment transactions excluded from expenses, balance and category breakdown in KPI calculations

- `[p3q6]` `GET /transactions/categories` aggregates distinct values across the new `categories` array field
- `[q5r2]` `PATCH /transactions/{id}` accepts `categories: list[str]` to replace the full categories list
- `[r8s7]` `POST /transactions/bulk-category` appends a category to each selected transaction without duplicating existing ones
- `[s2t4]` `Transaction` model field changed from `category: Optional[str]` to `categories: list[str]` — supports multiple categories per transaction
- `[t6u1]` Dashboard KPI and AI analysis updated for multi-category: investment exclusion checks the full list; category totals accumulate per category across all transactions; AI prompt renders comma-separated categories

- `[v2w6]` `GET /transactions/` supports filter params: `search` (case-insensitive regex on description), `categories` (array `$in` match), `date_from`, `date_to`, `amount_min`, `amount_max` — all optional, combinable

- `[w2x5]` `total_investments` and `balance_with_investments` added to `GET /dashboard/kpis` response — investments excluded from balance; both returned as separate fields; early-return dict for empty periods now includes these keys
- `[x4y7]` `is_investment()` broadened to match `inversion`, `inversiones`, `investment`, `investments` in addition to `inversión` — handles transactions imported without accent
- `[y6z9]` `POST /transactions/deduplicate` endpoint — groups user transactions by `(date, amount, description)`, keeps oldest of each group, deletes the rest; returns `{ deleted: N }`
- `[z8a1]` `GET /transactions/` sort stabilised — secondary sort by `_id ASC` added after `date DESC` to prevent duplicate rows across pages when transactions share the same date

- `[a2b5]` `CategoryRule` model (`app/models/category_rule.py`) — stores per-user categorization rules with unique compound index on `(user_id, category, pattern)`
- `[b4c8]` `app/services/categorization.py` — `_desc_key()` extracts merchant signature (first meaningful alphabetic token ≥4 letters, skipping generic banking tokens); `descriptions_match()` compares two descriptions by signature; `save_rule()` upserts a rule to MongoDB; `_get_rules_map()` loads rules grouped by pattern; `apply_rules_to_imported()` applies stored rules to newly inserted transactions
- `[c6d1]` `GET /category-rules/` — returns all rules for the current user grouped by category
- `[d8e4]` `DELETE /category-rules/{id}` — deletes a single rule by ID
- `[e1f7]` `PATCH /transactions/{id}` auto-categorizes — on category assignment, saves a rule and applies it to all matching transactions; response extended with `auto_categorized: int`
- `[f3g9]` `POST /transactions/bulk-category` auto-categorizes — saves rules and applies them for each processed transaction; response extended with `auto_categorized: int`
- `[g5h2]` CSV and PDF importers apply learned rules after insert — `apply_rules_to_imported()` called with newly imported transactions so existing rules take effect immediately
- `[h7i6]` `allow_date_edit: bool` added to `UserPreferences` model, `PreferencesRequest` and `PreferencesResponse` — persisted via `GET/PUT /preferences/`
- `[i9j3]` `investment_categories: list[str]` added to `GET /dashboard/kpis` response — actual stored investment category names returned so the frontend can build correct filter URLs

- `[j2k5]` `ImportLog` model (`app/models/import_log.py`) — stores per-user import events with `source`, `count`, `name` (optional bank/entity label) and `created_at` timestamp
- `[k4l8]` `GET /data/export/csv` — streams all user transactions as a downloadable CSV file (`date`, `description`, `amount`, `categories`, `source`)
- `[l6m1]` `GET /data/import-logs` — returns import history for the current user sorted by date descending, including `name` field
- `[m8n4]` `DELETE /data/` — permanently deletes all user transactions, category rules, analysis cache and import logs (HTTP 204)
- `[n1o7]` CSV and PDF `ImportRequest` bodies accept optional `name` field — stored in `ImportLog` to identify the bank or entity of each import
- `[o3p6]` `GET /ai-config/api-key` — returns the decrypted API key for the current user; used by the frontend "Show" button to reveal the stored key
- `[p5q8]` `POST /importers/csv/parse` returns `all_rows` — all non-empty CSV rows without header assumption, enabling the frontend header row selector
- `[q7r3]` `POST /importers/pdf/parse` — extracts tables from digitally-generated PDFs using `pdfplumber`; returns `all_rows` for manual column mapping; no AI involved; returns 422 with actionable message if no table is detected
- `[s2t1]` `save_rule: bool = True` added to `TransactionUpdate` — `PATCH /transactions/{id}` only saves a categorization rule and triggers auto-categorization when `save_rule` is `true`; allows the post-import review step to assign categories without creating rules
- `[t4u3]` `POST /transactions/check-duplicates` endpoint — accepts a list of `{date, amount, description}` objects and returns the indices of those already present in the user's transaction history; used by the frontend to flag potential duplicates before confirming an import
- `[u6v5]` `note: str | None` field added to `Transaction` model and `TransactionUpdate` — stores a free-text note per transaction; empty string on PATCH is coerced to `null`

### Fixed

- `[r9s1]` CSV and PDF import response referenced `t.category` (non-existent field) instead of `t.categories`, causing an `AttributeError` after `insert_many` and returning a 500 to the client
- `[u9v3]` Transaction `id` serialized as `_id` by FastAPI's `jsonable_encoder` (uses `by_alias=True` by default) — all transaction endpoints now use `model_dump(mode='json', by_alias=False)` via a shared `_tx_out` helper

---

## [0.1.0] - 2026-03-07

### Added

- `[k1d4]` FastAPI application with lifespan, CORS and `/health` endpoint
- `[l7e3]` Beanie ODM with Motor for async MongoDB
- `[m2f9]` Models: `User`, `Transaction`, `AiConfig`, `Alert`
- `[n8g1]` JWT authentication — register, login and `/auth/me` endpoints
- `[o4h6]` Password hashing with bcrypt via passlib
- `[p9i2]` API key encryption at rest using Fernet (cryptography)
- `[q5j7]` LiteLLM adapter for multi-provider AI support (Claude, OpenAI, Gemini, Mistral...)
- `[r3k8]` CSV import with column name normalization (EN/ES)
- `[s6l1]` Routers: `auth`, `transactions`, `ai-config`, `alerts`
- `[t2m4]` pydantic-settings for `.env` based configuration

### Fixed

- `[z9s7]` bcrypt downgraded to `4.0.1` for passlib compatibility (bcrypt 5.x removed `__about__`)

[Unreleased]: https://github.com/barcam-j/finity/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/barcam-j/finity/releases/tag/v0.1.0
