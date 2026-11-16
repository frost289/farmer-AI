import { env } from '../config/env.js';
import { aiRequest } from './aiGateway.js';

const call = (path, json, requestId) =>
  aiRequest({
    baseUrl: env.advisoryUrl,
    path: `/advisory${path}`,
    json,
    timeoutMs: env.advisoryTimeoutMs,
    requestId,
  });

export const query = (body, requestId) => call('/query', body, requestId);
export const treatment = (body, requestId) => call('/treatment', body, requestId);
export const plantingReadiness = (body, requestId) => call('/planting-readiness', body, requestId);
export const recommendCrops = (body, requestId) => call('/recommend-crops', body, requestId);
