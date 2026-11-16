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
