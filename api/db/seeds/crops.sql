INSERT INTO crops (name) VALUES
  ('maize'), ('rice'), ('groundnut'), ('soybean'), ('tobacco'), ('cassava'),
  ('sweet_potato'), ('beans'), ('cotton'), ('tomato'), ('pigeon_pea')
ON CONFLICT (name) DO NOTHING;
