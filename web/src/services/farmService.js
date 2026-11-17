import { api, unwrap } from './apiClient.js';

export const listFarms = (params) => api.get('/farms', { params }).then((r) => r.data.data);
export const getFarm = (id) => api.get(`/farms/${id}`).then(unwrap);
export const createFarm = (body) => api.post('/farms', body).then(unwrap);
export const updateFarm = (id, body) => api.put(`/farms/${id}`, body).then(unwrap);
export const deleteFarm = (id) => api.delete(`/farms/${id}`);
export const listPlantings = (farmId) => api.get(`/farms/${farmId}/plantings`).then(unwrap);
export const addPlanting = (farmId, body) => api.post(`/farms/${farmId}/plantings`, body).then(unwrap);
