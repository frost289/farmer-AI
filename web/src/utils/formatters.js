export const humanize = (value) =>
  value ? String(value).replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : '';

export const percent = (value) => (value == null ? '-' : `${Math.round(value * 100)}%`);

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

const MESSAGES = {
  VALIDATION_ERROR: 'Please check the information you entered.',
  INVALID_IMAGE: 'This photo cannot be used. Please send a JPEG or PNG picture.',
  UNAUTHORIZED: 'Please log in again.',
  FORBIDDEN: 'You do not have access to this page.',
  NOT_FOUND: 'We could not find what you were looking for.',
  CONFLICT: 'This phone number is already registered.',
  PAYLOAD_TOO_LARGE: 'The photo is too large. Please use a smaller picture.',
  LOW_QUALITY_IMAGE: 'The photo is too blurry or dark. Please take a clearer photo in daylight.',
  RATE_LIMITED: 'Too many tries. Please wait a few minutes.',
  AI_UNAVAILABLE: 'The FarmAI assistant is not available right now. Please try again later.',
  AI_TIMEOUT: 'The assistant took too long. Please try again.',
  WEATHER_UNAVAILABLE: 'Weather information is not available right now.',
  NETWORK_ERROR: 'No internet connection. Please check your network and try again.',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
  NO_PREDICTION: 'We could not recognise the problem in this photo. Try another photo or describe the symptoms.',
};

/** Friendly text for an error code (the web app switches on code, never on server message). */
export const messageForCode = (code, fallback) =>
  MESSAGES[code] || fallback || MESSAGES.INTERNAL_ERROR;

export const errorMessage = (err) => messageForCode(err?.code, err?.message);
