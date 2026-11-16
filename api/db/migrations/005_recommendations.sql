CREATE TABLE recommendations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id    UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  type       VARCHAR(30) NOT NULL CHECK (type IN ('crop','planting_readiness')),
  payload    JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recommendations_farm_id ON recommendations(farm_id);
