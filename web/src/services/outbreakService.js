import { api, unwrap } from './apiClient.js';

export const listOutbreaks = (params) => api.get('/outbreaks', { params }).then(unwrap);
export const listAlerts = () => api.get('/alerts').then(unwrap);
export const createAlert = (body) => api.post('/alerts', body).then(unwrap);
