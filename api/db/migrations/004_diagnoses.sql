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
