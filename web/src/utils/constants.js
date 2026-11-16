export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
export const ASSET_BASE = API_URL.replace(/\/api\/v1\/?$/, '');

export const ROLES = {
  FARMER: 'farmer',
  FIELD_AGENT: 'field_agent',
  OFFICER: 'extension_officer',
  ADMIN: 'admin',
};
export const OFFICER_ROLES = [ROLES.OFFICER, ROLES.ADMIN];
export const ALL_ROLES = Object.values(ROLES);

export const CROPS = [
  'maize', 'rice', 'groundnut', 'soybean', 'tobacco', 'cassava',
  'sweet_potato', 'beans', 'cotton', 'tomato', 'pigeon_pea',
];
export const SOIL_TYPES = ['sandy', 'loam', 'clay', 'silt', 'sandy_loam', 'clay_loam', 'unknown'];
export const DISTRICTS = [
  'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza', 'Dowa', 'Karonga',
  'Kasungu', 'Likoma', 'Lilongwe', 'Machinga', 'Mangochi', 'Mchinji', 'Mulanje', 'Mwanza',
  'Mzimba', 'Neno', 'Nkhata Bay', 'Nkhotakota', 'Nsanje', 'Ntcheu', 'Ntchisi', 'Phalombe',
  'Rumphi', 'Salima', 'Thyolo', 'Zomba',
];

export const POLL_INTERVAL_MS = 2000;
export const POLL_MAX_MS = 60_000;
export const MAX_IMAGE_MB = 5;
export const MAX_SYMPTOMS = 1000;
export const MAX_QUESTION = 500;
