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
