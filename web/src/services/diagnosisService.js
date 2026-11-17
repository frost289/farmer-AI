import { api, unwrap } from './apiClient.js';

/** Sends a photo and/or symptoms. Returns { diagnosis_id, status } (HTTP 202). */
export function submitDiagnosis({ farmId, crop, symptoms, image }) {
  const form = new FormData();
  form.append('farm_id', farmId);
  if (crop) form.append('crop', crop);
  if (symptoms) form.append('symptoms', symptoms);
  if (image) form.append('image', image);
  return api.post('/diagnoses', form).then(unwrap);
}

export const getDiagnosis = (id) => api.get(`/diagnoses/${id}`).then(unwrap);
export const listDiagnoses = (params) => api.get('/diagnoses', { params }).then((r) => r.data.data);
