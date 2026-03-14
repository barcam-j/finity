# Changelog — Backend

All notable changes to the backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry has a unique ID `[XXXX]` for easy reference in PRs and discussions.

---

## [Unreleased]

### Added

- `[u7n3]` Modular importer architecture — `ImporterBase` ABC, registry with `register_importers()`, importers mounted under `/importers/<type>`
- `[v1o8]` CSV importer module (`app/importers/csv/`) with improved column detection (EN/ES aliases), `source='csv'` tagging on each transaction
- `[w4p2]` Removed old `POST /transactions/import` endpoint — CSV import now served exclusively from `POST /importers/csv/import`

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
