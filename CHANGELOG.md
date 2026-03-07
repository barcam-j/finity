# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] - 2026-03-07

### Added

#### Frontend
- Vue 3 + Vite project scaffolded with bun as package manager
- Vue Router with navigation guard — unauthenticated users redirected to `/login`
- Pinia stores: `auth`, `transactions`, `ai`
- HTTP service layer: `api.js` (base client with JWT header), `auth.js`, `transactions.js`
- Login and register form in a single view with toggle between modes
- `AppLayout` component with sidebar navigation and sign out button
- Light / dark / system theme switcher — persisted in `localStorage`, applied via `data-theme` on `<html>`
- Orange accent color (`oklch(0.70 0.19 42)`) for active nav links, buttons and input focus
- CSS architecture with OKLCH colors separated into layers:
  - `primitives.css` — raw color palette
  - `themes/light.css` and `themes/dark.css` — semantic tokens
  - `base.css` — reset and typography
  - `main.css` — entry point
- Prettier configured with single quotes, no semicolons, 2 spaces, print width 100

#### Backend
- FastAPI application with lifespan, CORS and `/health` endpoint
- Beanie ODM with Motor for async MongoDB
- Models: `User`, `Transaction`, `AiConfig`, `Alert`
- JWT authentication — register, login and `/auth/me` endpoints
- Password hashing with bcrypt via passlib
- API key encryption at rest using Fernet (cryptography)
- LiteLLM adapter for multi-provider AI support (Claude, OpenAI, Gemini, Mistral...)
- CSV import with column name normalization (EN/ES)
- Routers: `auth`, `transactions`, `ai-config`, `alerts`
- pydantic-settings for `.env` based configuration

#### Project
- Git Flow branching strategy (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`)
- `main` and `develop` protected via GitHub Rulesets (PR required)
- GitHub Action to enforce that only `release/*` and `hotfix/*` branches can merge into `main`
- `CLAUDE.md` with project context for AI-assisted development
- `README.md` with full project documentation including color system guide

### Fixed
- bcrypt downgraded to `4.0.1` for passlib compatibility (bcrypt 5.x removed `__about__`)
- Vite downgraded to `5.x` for Node.js 21 compatibility

[Unreleased]: https://github.com/barcam-j/finity/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/barcam-j/finity/releases/tag/v0.1.0
