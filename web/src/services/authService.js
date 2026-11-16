import { api, unwrap } from './apiClient.js';

export const register = (body) => api.post('/auth/register', body).then(unwrap);
export const login = (body) => api.post('/auth/login', body).then(unwrap);
export const logout = (refreshToken) => api.post('/auth/logout', { refresh_token: refreshToken });
export const getMe = () => api.get('/users/me').then(unwrap);
export const updateMe = (body) => api.put('/users/me', body).then(unwrap);
export const listUsers = (params) =>
  api.get('/users', { params }).then((r) => ({ items: r.data.data, meta: r.data.meta }));
export const changeRole = (id, role) => api.put(`/users/${id}/role`, { role }).then(unwrap);
export const getStats = () => api.get('/admin/stats').then(unwrap);
