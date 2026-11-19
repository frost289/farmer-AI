import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

class AiHttpError extends Error {
  constructor(status, body) {
    super(`AI service responded ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function attempt({ url, method, json, formData, timeoutMs, requestId }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'X-Internal-Key': env.internalApiKey,
        'X-Request-ID': requestId || '',
        ...(json ? { 'Content-Type': 'application/json' } : {}),
      },
      body: json ? JSON.stringify(json) : formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new AiHttpError(res.status, await res.json().catch(() => null));
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** The only place that talks to the Python AI services. Retries once on 5xx / network error. */
export async function aiRequest({ baseUrl, path, method = 'POST', ...opts }) {
  const url = `${baseUrl}/ai/v1${path}`;
  const args = { url, method, ...opts };
  try {
    try {
      return await attempt(args);
    } catch (err) {
      const retryable = err instanceof AiHttpError ? err.status >= 500 : err.name !== 'AbortError';
      if (!retryable) throw err;
      return await attempt(args);
    }
  } catch (err) {
    // Shows the real reason in the Render logs (the user only sees the friendly message).
    logger.warn('AI call failed', {
      url,
      status: err.status,
      error: err.message,
      cause: err.cause?.code || err.cause?.message,
      body: err.body,
    });
    if (err.name === 'AbortError') {
      throw new ApiError(504, 'AI_TIMEOUT', 'The AI service took too long. Please try again.');
    }
    if (err instanceof AiHttpError && err.status < 500 && err.body?.error?.code) {
      const { code, message, details } = err.body.error;
      throw new ApiError(err.status, code, message, details);
    }
    throw new ApiError(503, 'AI_UNAVAILABLE', 'The AI service is not available right now.');
  }
}
