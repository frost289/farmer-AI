import { env } from '../config/env.js';
import { aiRequest } from './aiGateway.js';

export async function diagnose({ buffer, mimetype, crop, requestId }) {
  const formData = new FormData();
  formData.append('image', new Blob([buffer], { type: mimetype }), 'image');
  if (crop) formData.append('crop', crop);
  if (requestId) formData.append('request_id', requestId);
  return aiRequest({
    baseUrl: env.visionUrl,
    path: '/vision/diagnose',
    formData,
    timeoutMs: env.visionTimeoutMs,
    requestId,
  });
}
