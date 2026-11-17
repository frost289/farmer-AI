import { api, unwrap } from './apiClient.js';

export const ask = ({ farmId, question, language }) =>
  api.post('/advisory/ask', { farm_id: farmId || undefined, question, language }).then(unwrap);

export const getPlantingReadiness = ({ farmId, crop }) =>
  api.get('/planting-readiness', { params: { farm_id: farmId, crop } }).then(unwrap);

export const getCropRecommendations = (farmId) =>
  api.get('/recommendations/crops', { params: { farm_id: farmId } }).then(unwrap);
