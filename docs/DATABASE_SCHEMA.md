# Database Schema (PostgreSQL)

Owner: Member 1. Migrations live in `api/db/migrations/` (numbered SQL files). Naming follows `NAMING_CONVENTIONS.md`; enum values follow `SHARED_DATA_FIELDS.md`.

## 1. Rules

- Primary key `id UUID DEFAULT gen_random_uuid()`.
- Every table has `created_at` and `updated_at` (`TIMESTAMPTZ`, default `now()`).
- Foreign keys are indexed. Use `ON DELETE CASCADE` only where noted.
- Only the api touches the database. AI services never connect to it.
- Never edit an applied migration. Add a new numbered file.

## 2. Setup

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## 3. Tables

### 3.1 users (001_users.sql)
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(20)  NOT NULL UNIQUE,
  email         VARCHAR(255) UNIQUE,
  password_hash TEXT         NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'farmer'
                CHECK (role IN ('farmer','field_agent','extension_officer','admin')),
  language      VARCHAR(2)   NOT NULL DEFAULT 'en' CHECK (language IN ('en','ny')),
  district      VARCHAR(80),
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

### 3.2 farms (002_farms.sql)
```sql
CREATE TABLE farms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  district   VARCHAR(80)  NOT NULL,
  lat        NUMERIC(9,6) CHECK (lat BETWEEN -90 AND 90),
  lng        NUMERIC(9,6) CHECK (lng BETWEEN -180 AND 180),
  soil_type  VARCHAR(20) NOT NULL DEFAULT 'unknown'
             CHECK (soil_type IN ('sandy','loam','clay','silt','sandy_loam','clay_loam','unknown')),
  size_ha    NUMERIC(8,2) CHECK (size_ha > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_farms_owner_id ON farms(owner_id);
CREATE INDEX idx_farms_district ON farms(district);
```

### 3.3 plantings (003_plantings.sql)
```sql
CREATE TABLE plantings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id               UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop                  VARCHAR(40) NOT NULL,
  variety               VARCHAR(80),
  planting_date         DATE,
  expected_harvest_date DATE,
  status                VARCHAR(20) NOT NULL DEFAULT 'planned'
                        CHECK (status IN ('planned','planted','growing','harvested','failed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_plantings_farm_id ON plantings(farm_id);
```

### 3.4 diagnoses (004_diagnoses.sql)
```sql
CREATE TABLE diagnoses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id),
  farm_id        UUID NOT NULL REFERENCES farms(id),
  crop           VARCHAR(40),
  image_url      TEXT,
  symptoms       TEXT,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','processing','completed','failed')),
  type           VARCHAR(20) CHECK (type IN ('disease','pest','healthy','unknown')),
  name           VARCHAR(80),
  confidence     NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
  severity       VARCHAR(20) CHECK (severity IN ('low','moderate','high')),
  severity_pct   NUMERIC(5,2) CHECK (severity_pct BETWEEN 0 AND 100),
  treatment      JSONB,
  low_confidence BOOLEAN NOT NULL DEFAULT FALSE,
  model_version  VARCHAR(20),
  error_code     VARCHAR(40),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (image_url IS NOT NULL OR symptoms IS NOT NULL)
);
CREATE INDEX idx_diagnoses_user_id ON diagnoses(user_id);
CREATE INDEX idx_diagnoses_farm_id ON diagnoses(farm_id);
CREATE INDEX idx_diagnoses_name_created ON diagnoses(name, created_at);
```

### 3.5 recommendations (005_recommendations.sql)
```sql
CREATE TABLE recommendations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id    UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  type       VARCHAR(30) NOT NULL CHECK (type IN ('crop','planting_readiness')),
  payload    JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recommendations_farm_id ON recommendations(farm_id);
```

### 3.6 weather_cache (006_weather_cache.sql)
```sql
CREATE TABLE weather_cache (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lat        NUMERIC(9,6) NOT NULL,
  lng        NUMERIC(9,6) NOT NULL,
  forecast   JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lat, lng)
);
```
Cache lifetime: 3 hours. Round coordinates to 2 decimals before lookup.

### 3.7 outbreaks (007_outbreaks.sql)
```sql
CREATE TABLE outbreaks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease      VARCHAR(80) NOT NULL,
  crop         VARCHAR(40),
  district     VARCHAR(80) NOT NULL,
  case_count   INTEGER NOT NULL CHECK (case_count >= 0),
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (disease, crop, district, period_start)
);
CREATE INDEX idx_outbreaks_district ON outbreaks(district);
```
Filled by the `outbreak.aggregator` job (daily) from completed diagnoses.

### 3.8 alerts (008_alerts.sql)
```sql
CREATE TABLE alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(150) NOT NULL,
  message          TEXT NOT NULL,
  target_district  VARCHAR(80),
  target_user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  status           VARCHAR(20) NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','sent','cancelled')),
  created_by       UUID NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.9 refresh_tokens (009_refresh_tokens.sql)
```sql
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

## 4. Relationships

```
users 1---* farms 1---* plantings
users 1---* diagnoses *---1 farms
farms 1---* recommendations
users 1---* alerts (created_by, target_user_id)
users 1---* refresh_tokens
diagnoses --(aggregated daily)--> outbreaks
```

## 5. Seeds (`api/db/seeds/`)

- `crops.sql`: crop list from `SHARED_DATA_FIELDS.md`.
- `districts.sql`: Malawi districts (consistent spelling used in all tables).

## 6. Environment

`DATABASE_URL=postgres://user:password@localhost:5432/farmai`
Use a separate database per environment (`farmai_dev`, `farmai_test`, production).
