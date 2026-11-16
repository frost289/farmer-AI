// Mirrors docs/SHARED_DATA_FIELDS.md. Change there first.
export const ROLES = ['farmer', 'field_agent', 'extension_officer', 'admin'];
export const SELF_REGISTER_ROLES = ['farmer', 'field_agent'];
export const PRIVILEGED_ROLES = ['extension_officer', 'admin'];
export const LANGUAGES = ['en', 'ny'];
export const SOIL_TYPES = ['sandy', 'loam', 'clay', 'silt', 'sandy_loam', 'clay_loam', 'unknown'];
export const CROPS = [
  'maize', 'rice', 'groundnut', 'soybean', 'tobacco', 'cassava',
  'sweet_potato', 'beans', 'cotton', 'tomato', 'pigeon_pea',
];
export const PLANTING_STATUSES = ['planned', 'planted', 'growing', 'harvested', 'failed'];
export const LOW_CONFIDENCE_THRESHOLD = 0.5;
export const WEATHER_CACHE_HOURS = 3;
export const OFFICER_ROLES = PRIVILEGED_ROLES;
export const LIMITS = {
  lowConfidence: LOW_CONFIDENCE_THRESHOLD,
  weatherCacheHours: WEATHER_CACHE_HOURS,
  symptomsMax: 1000,
  questionMax: 500,
  pageMax: 100,
  uploadMaxMb: 5,
};
