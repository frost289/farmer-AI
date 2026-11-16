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
