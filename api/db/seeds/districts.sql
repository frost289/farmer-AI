INSERT INTO districts (name, region) VALUES
  ('Chitipa','northern'), ('Karonga','northern'), ('Likoma','northern'), ('Mzimba','northern'),
  ('Nkhata Bay','northern'), ('Rumphi','northern'),
  ('Dedza','central'), ('Dowa','central'), ('Kasungu','central'), ('Lilongwe','central'),
  ('Mchinji','central'), ('Nkhotakota','central'), ('Ntcheu','central'), ('Ntchisi','central'),
  ('Salima','central'),
  ('Balaka','southern'), ('Blantyre','southern'), ('Chikwawa','southern'),
  ('Chiradzulu','southern'), ('Machinga','southern'), ('Mangochi','southern'),
  ('Mulanje','southern'), ('Mwanza','southern'), ('Neno','southern'), ('Nsanje','southern'),
  ('Phalombe','southern'), ('Thyolo','southern'), ('Zomba','southern')
ON CONFLICT (name) DO NOTHING;
