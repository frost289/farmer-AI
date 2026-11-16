# Shared Data Fields

Single source of truth for field names, types and allowed values used across `web`, `api`, `advisory` and `vision`. Do not invent alternatives. Changes need a PR approved by all affected members.

## 1. Common Types

| Type | Format | Example |
|---|---|---|
| `uuid` | UUID v4 string | `"b3b8c5a2-..."` |
| `timestamp` | ISO 8601 UTC | `"2026-11-15T08:30:00Z"` |
| `date` | `YYYY-MM-DD` | `"2026-11-20"` |
| `confidence` | float 0.0 to 1.0 | `0.87` |
| `pct` | number 0 to 100 | `35` |

## 2. Enums

| Name | Allowed values |
|---|---|
| `role` | `farmer`, `field_agent`, `extension_officer`, `admin` |
| `language` | `en`, `ny` |
| `soil_type` | `sandy`, `loam`, `clay`, `silt`, `sandy_loam`, `clay_loam`, `unknown` |
| `diagnosis_status` | `pending`, `processing`, `completed`, `failed` |
| `diagnosis_type` | `disease`, `pest`, `healthy`, `unknown` |
| `severity` | `low`, `moderate`, `high` |
| `planting_verdict` | `plant`, `wait`, `not_recommended` |
| `soil_moisture` | `dry`, `adequate`, `wet` |
| `alert_status` | `draft`, `sent`, `cancelled` |
| `planting_status` | `planned`, `planted`, `growing`, `harvested`, `failed` |
| `season` | `rainy`, `dry` |

## 3. Entity Fields

### User
`id`, `name`, `phone`, `email` (optional), `role`, `language`, `district` (optional), `is_active`, `created_at`, `updated_at`.
Never returned: `password_hash`.

### Farm
`id`, `owner_id`, `name`, `district`, `lat`, `lng`, `soil_type`, `size_ha`, `created_at`, `updated_at`.

### Planting
`id`, `farm_id`, `crop`, `variety` (optional), `planting_date`, `expected_harvest_date` (optional), `status`.

### Diagnosis
`id`, `user_id`, `farm_id`, `crop` (optional), `image_url` (optional), `symptoms` (optional), `status`, `type`, `name` (label), `confidence`, `severity`, `severity_pct`, `treatment`, `low_confidence`, `model_version`, `error_code` (optional), `created_at`, `updated_at`.

### Treatment (object)
```json
{ "organic": ["string"], "chemical": ["string"], "prevention": ["string"], "warnings": ["string"] }
```

### Planting Readiness
`verdict`, `reason`, `rain_onset_date` (optional), `soil_moisture`, `confidence`.

### Crop Recommendation
`crop`, `variety` (optional), `score` (0.0 to 1.0), `reason`.

### Weather Forecast Day
`date`, `rain_mm`, `temp_c`, `humidity_pct` (optional).

### Location
`lat` (-90 to 90), `lng` (-180 to 180), optional `district`.

### Outbreak
`id`, `disease`, `crop`, `district`, `case_count`, `period_start`, `period_end`.

### Alert
`id`, `title`, `message`, `target_district` (optional), `target_user_id` (optional), `status`, `created_by`, `created_at`.

## 4. Crop Names (initial list)

`maize`, `rice`, `groundnut`, `soybean`, `tobacco`, `cassava`, `sweet_potato`, `beans`, `cotton`, `tomato`, `pigeon_pea`.
Add new values by PR. Use these exact strings everywhere.

## 5. Disease and Pest Labels

Defined in `docs/label-taxonomy.json` (owned jointly by Members 3 and 4). Rules:

- Lowercase `snake_case`, e.g. `maize_streak_virus`, `fall_armyworm`, `cassava_mosaic_disease`, `healthy`.
- The same label string is used by Vision output, Advisory input and the database.
- Display names (English and Chichewa) live in the taxonomy file, not in code.

## 6. Limits

| Item | Limit |
|---|---|
| Image upload | JPEG/PNG, max 5 MB |
| Symptom text | max 1000 characters |
| Question text | max 500 characters |
| Pagination | `limit` default 20, max 100 |
| Low confidence threshold | confidence below 0.5 |
| SMS (future) | 160 characters |

## 7. Headers

| Header | Used for |
|---|---|
| `Authorization: Bearer <jwt>` | user to api |
| `X-Internal-Key` | api to AI services |
| `X-Request-ID` | trace id, forwarded everywhere |
