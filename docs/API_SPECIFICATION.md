# API Specification (v1)

Contract between **web (M2)**, **api (M1/M2)**, **advisory (M3)** and **vision (M4)**. Field names and enums come from `SHARED_DATA_FIELDS.md`. Errors follow `ERROR_FORMATS.md`.

## 1. Conventions

- Public API base: `/api/v1`. AI services (internal only): `/ai/v1`.
- JSON, `snake_case`, UUID ids, ISO 8601 UTC timestamps.
- Auth: `Authorization: Bearer <jwt>`. AI services: `X-Internal-Key`.
- Every request carries `X-Request-ID` and it is forwarded to AI services.
- Success: `{ "data": ..., "meta": {} }`. Pagination: `?page=1&limit=20`.

## 2. Public API (web to api)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | Create account |
| POST | `/auth/login` | public | Get tokens |
| POST | `/auth/refresh` | public | New access token |
| GET | `/users/me` | any | Current profile |
| PUT | `/users/me` | any | Update profile |
| GET | `/farms` | any | List own farms |
| POST | `/farms` | any | Create farm |
| GET | `/farms/:id` | owner, officer | Farm detail |
| PUT | `/farms/:id` | owner | Update farm |
| DELETE | `/farms/:id` | owner | Delete farm |
| GET | `/farms/:id/plantings` | owner | List plantings |
| POST | `/farms/:id/plantings` | owner | Add planting |
| POST | `/diagnoses` | any | Submit photo and/or symptoms |
| GET | `/diagnoses/:id` | owner, officer | Status and result |
| GET | `/diagnoses` | any | History (`?farm_id=`) |
| POST | `/advisory/ask` | any | Ask an agronomy question |
| GET | `/planting-readiness` | any | `?farm_id=&crop=` |
| GET | `/recommendations/crops` | any | `?farm_id=` |
| GET | `/weather` | any | `?farm_id=` |
| GET | `/outbreaks` | officer, admin | `?district=&from=&to=` |
| GET | `/weather/heatmap` | officer, admin | Regional weather |
| GET | `/alerts` | any | Alerts for the user |
| POST | `/alerts` | officer, admin | Create alert |
| GET | `/users` | admin | List users |
| PUT | `/users/:id/role` | admin | Change role |
| GET | `/health` | public | Service health |

### 2.1 Auth

`POST /auth/register`
```json
{ "name": "Mary Banda", "phone": "+265999000111", "email": null,
  "password": "min 8 chars", "role": "farmer", "language": "ny" }
```
`POST /auth/login`
```json
{ "phone": "+265999000111", "password": "..." }
```
Response `data`:
```json
{ "access_token": "...", "refresh_token": "...", "user": { "id": "uuid", "name": "...", "role": "farmer", "language": "ny" } }
```
Access token lifetime 15 minutes, refresh token 7 days.

### 2.2 Farms

`POST /farms`
```json
{ "name": "Home plot", "district": "Lilongwe", "lat": -13.96, "lng": 33.78,
  "soil_type": "loam", "size_ha": 1.5 }
```

### 2.3 Diagnoses

`POST /diagnoses` (multipart/form-data): `farm_id` (required), `crop`, `symptoms`, `image`. At least one of `image` or `symptoms`.
Response **202**:
```json
{ "data": { "diagnosis_id": "uuid", "status": "pending" } }
```
`GET /diagnoses/:id` response `data`:
```json
{
  "id": "uuid", "status": "completed", "created_at": "2026-11-15T08:30:00Z",
  "result": {
    "type": "disease", "name": "maize_streak_virus", "confidence": 0.87,
    "severity": "moderate", "severity_pct": 35,
    "treatment": { "organic": [], "chemical": [], "prevention": [], "warnings": [] },
    "low_confidence": false, "model_version": "v0.1.0"
  },
  "error_code": null
}
```
While not `completed`/`failed`, `result` is `null`. The web app polls every 2 seconds, stops after 60 seconds.

### 2.4 Advisory

`POST /advisory/ask`
```json
{ "farm_id": "uuid", "question": "When should I weed my maize?", "language": "en" }
```
Response `data`: `{ "answer": "...", "language": "en", "language_fallback": false }`. `language` is the actual response language; `language_fallback` is true when English is returned for a Chichewa request.

`GET /planting-readiness?farm_id=uuid&crop=maize`
```json
{ "data": { "verdict": "wait", "reason": "Rains not yet established", "rain_onset_date": "2026-11-28",
  "soil_moisture": "dry", "confidence": 0.8 } }
```

`GET /recommendations/crops?farm_id=uuid`
```json
{ "data": { "recommendations": [ { "crop": "maize", "variety": "SC403", "score": 0.91, "reason": "Suited to loam soil and expected rainfall" } ] } }
```

### 2.5 Weather and Outbreaks

`GET /weather?farm_id=uuid` response `data`:
```json
{ "location": { "lat": -13.96, "lng": 33.78 },
  "forecast_7d": [ { "date": "2026-11-16", "rain_mm": 0, "temp_c": 29 } ],
  "fetched_at": "2026-11-15T06:00:00Z" }
```
`GET /outbreaks` response `data`: array of `{ "id", "disease", "crop", "district", "case_count", "period_start", "period_end" }`.

## 3. Internal AI API (api to AI services)

Timeouts: vision 30 s, advisory 20 s. Retry once on 5xx. All AI services expose `GET /health` returning `{ "status": "ok", "model_version": "v0.1.0" }`. Ports: advisory 8001, vision 8002.

### 3.1 Vision (M4)

`POST /ai/v1/vision/diagnose` (multipart): `image` (JPEG/PNG, max 5 MB), `crop` (optional), `request_id`.
```json
{ "predictions": [ { "label": "maize_streak_virus", "type": "disease", "confidence": 0.87 } ],
  "severity_pct": 35, "model_version": "v0.1.0",
  "quality": { "usable": true, "issues": [] } }
```
Predictions sorted by confidence (highest first), at most 3. If `quality.usable` is false, api returns `LOW_QUALITY_IMAGE`.

`POST /ai/v1/vision/segment` (later phase): returns mask and damaged-area percentage.

### 3.2 Advisory (M3)

`POST /ai/v1/advisory/query`
```json
{ "question": "...", "language": "en",
  "context": { "crop": "maize", "district": "Lilongwe", "season": "rainy" } }
```
Response: `{ "answer": "...", "sources": [], "model_version": "v0.1.0" }`

`POST /ai/v1/advisory/treatment`
```json
{ "diagnosis": { "label": "maize_streak_virus", "severity_pct": 35 }, "crop": "maize", "language": "en" }
```
Response: Treatment object with `organic`, `chemical`, `prevention`, and `warnings` arrays, plus `language` (actual language returned) and `language_fallback` (boolean).

`POST /ai/v1/advisory/planting-readiness`
```json
{ "crop": "maize", "language": "ny", "location": { "lat": -13.96, "lng": 33.78 }, "soil_type": "loam",
  "weather": { "forecast_7d": [ { "date": "2026-11-16", "rain_mm": 0, "temp_c": 29 } ] } }
```
Response: Planting Readiness object (same as 2.4), plus `language` and `language_fallback` metadata.

`POST /ai/v1/advisory/recommend-crops`
```json
{ "language": "ny", "location": { "lat": -13.96, "lng": 33.78 }, "soil_type": "loam", "weather": { "forecast_7d": [] } }
```
Response: `recommendations` array plus top-level `language` and `language_fallback` metadata.

### 3.3 Speech (later phase, M4)

`POST /ai/v1/speech/transcribe` (audio file, `language`) returns `{ "text": "...", "confidence": 0.9, "language": "ny" }`.

## 4. Diagnosis Flow

1. Web uploads to api. Api stores the image, saves a `pending` row, returns 202.
2. Worker calls Vision `/diagnose` and sets `processing`.
3. Worker calls Advisory `/treatment` with the top prediction.
4. Worker merges, saves, sets `completed`. On any failure sets `failed` with `error_code`.
5. If top confidence is below 0.5, set `low_confidence: true` and the web app shows "consult an extension officer".
6. If only `symptoms` were sent (no image), the worker skips Vision and asks Advisory to suggest likely causes.

## 5. Mocking and Changes

- M3 and M4 publish stub endpoints returning fixed responses in these exact shapes in week 1.
- A machine-readable copy lives in `docs/api-spec.yaml` (OpenAPI) once created. This file stays the human reference.
- Any change needs a PR approved by every affected member. Breaking changes need a version bump (`/v2`).
