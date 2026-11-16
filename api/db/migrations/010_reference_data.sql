CREATE TABLE crops (
  name       VARCHAR(40) PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE districts (
  name       VARCHAR(80) PRIMARY KEY,
  region     VARCHAR(20) NOT NULL CHECK (region IN ('northern','central','southern')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
