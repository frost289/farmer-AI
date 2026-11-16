import { api, unwrap } from './apiClient.js';

export const getFarmWeather = (farmId) => api.get('/weather', { params: { farm_id: farmId } }).then(unwrap);
export const getHeatmap = () => api.get('/weather/heatmap').then(unwrap);
