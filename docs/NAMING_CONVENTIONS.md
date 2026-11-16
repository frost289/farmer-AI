# Naming Conventions

Consistency matters more than personal preference. Use these everywhere.

## 1. Quick Reference

| Thing | Convention | Example |
|---|---|---|
| JSON fields (API) | `snake_case` | `farm_id`, `severity_pct` |
| Database tables | `snake_case`, plural | `farms`, `diagnoses` |
| Database columns | `snake_case` | `created_at`, `owner_id` |
| Primary keys | `id` (UUID) | `id` |
| Foreign keys | `<table_singular>_id` | `farm_id` |
| JS variables, functions | `camelCase` | `getFarmById` |
| JS constants | `UPPER_SNAKE_CASE` | `MAX_UPLOAD_SIZE` |
| React components | `PascalCase` | `DiagnosisResult.jsx` |
| React hooks | `useCamelCase` | `useAuth.js` |
| JS non-component files | `camelCase` | `apiClient.js` |
| API module files | `<module>.<layer>.js` | `farms.controller.js` |
| Python variables, functions | `snake_case` | `get_crop_scores` |
| Python classes | `PascalCase` | `DiagnosisRequest` |
| Python files and folders | `snake_case` | `crop_recommender.py` |
| Top-level folders | `kebab-case` or one word | `ai-services`, `farms` |
| Env variables | `UPPER_SNAKE_CASE` | `DATABASE_URL` |
| Git branches | `type/module-name` | `feature/api-farms` |
| Docs files | `UPPER_SNAKE_CASE.md` | `API_SPECIFICATION.md` |

## 2. JSON Field Mapping

API and database use `snake_case`. The web app receives `snake_case` and may convert to `camelCase` in one place only (the `services/` layer). Do not mix both styles in one object.

## 3. API URLs

- Lowercase, plural nouns, kebab-case: `/api/v1/farms`, `/api/v1/planting-readiness`.
- No verbs in URLs except non-CRUD actions (e.g. `/advisory/ask`).
- Path params: `:id`. Query params: `snake_case` (`?farm_id=...`).

## 4. Labels and Enums

- Values are lowercase `snake_case` strings: `maize_streak_virus`, `moderate`.
- Never use numbers or display text as enum values.
- Allowed values are defined only in `SHARED_DATA_FIELDS.md`.

## 5. Booleans

Start with `is_`, `has_` or `can_`: `is_active`, `has_image`.
The only exception is `low_confidence` (kept by the diagnosis contract).

## 6. Dates and Time

- Timestamps: ISO 8601 UTC, e.g. `2026-11-15T08:30:00Z`. Columns: `created_at`, `updated_at`.
- Dates only: `YYYY-MM-DD`, fields end with `_date` (e.g. `planting_date`).

## 7. Units

- Area: hectares, `size_ha`.
- Rainfall: millimetres, `rain_mm`.
- Temperature: Celsius, `temp_c`.
- Percentages: 0 to 100, named `*_pct`. Confidence scores: 0.0 to 1.0, named `confidence`.

## 8. Language Codes

`en` (English), `ny` (Chichewa).

## 9. Versions

- API: `/api/v1`. AI services: `/ai/v1`.
- Models: semantic version string, e.g. `model_version: "v0.1.0"`.
