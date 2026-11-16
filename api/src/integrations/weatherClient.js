import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/** Fetches a 7-day forecast from Open-Meteo (default provider, no key needed). */
export async function fetchForecast(lat, lng) {
  const url = new URL(env.weatherApiUrl);
  url.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    daily: 'precipitation_sum,temperature_2m_max',
    forecast_days: '7',
    timezone: 'auto',
  }).toString();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Weather provider responded ${res.status}`);
    const { daily } = await res.json();
    return daily.time.map((date, i) => ({
      date,
      rain_mm: daily.precipitation_sum[i] ?? 0,
      temp_c: daily.temperature_2m_max[i],
    }));
  } catch {
    throw new ApiError(503, 'WEATHER_UNAVAILABLE', 'Weather data is not available right now.');
  }
}
