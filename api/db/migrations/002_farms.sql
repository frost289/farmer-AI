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
