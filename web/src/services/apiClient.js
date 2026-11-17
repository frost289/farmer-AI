import axios from 'axios';
import { API_URL } from '../utils/constants.js';
import { clearSession, getSession, setAccessToken } from '../utils/storage.js';

export const api = axios.create({ baseURL: API_URL, timeout: 30_000 });

api.interceptors.request.use((config) => {
  const { accessToken } = getSession();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing = null;

async function refreshAccessToken() {
  const { refreshToken } = getSession();
  if (!refreshToken) throw new Error('no refresh token');
  const res = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
  const token = res.data.data.access_token;
  setAccessToken(token);
  return token;
}

/** Converts any axios error into { status, code, message, details, requestId }. */
export function normalizeError(error) {
  const body = error.response?.data?.error;
  return {
    status: error.response?.status ?? 0,
    code: body?.code ?? (error.response ? 'INTERNAL_ERROR' : 'NETWORK_ERROR'),
    message: body?.message ?? error.message,
    details: body?.details ?? [],
    requestId: body?.request_id,
  };
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        refreshing ??= refreshAccessToken().finally(() => {
          refreshing = null;
        });
        const token = await refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        clearSession();
        window.dispatchEvent(new Event('farmai:logout'));
      }
    }
    throw normalizeError(error);
  },
);

/** Unwraps the { data, meta } envelope. */
export const unwrap = (res) => res.data.data;
export const unwrapPage = (res) => ({ items: res.data.data, meta: res.data.meta });
