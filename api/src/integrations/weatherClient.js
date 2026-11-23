import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Provider adapter boundary. Keep provider-specific request/response handling here
 * so another verified Malawi source can be added without changing API consumers.
 */
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
    const payload = await res.json();
    const { daily } = payload ?? {};
    if (
      !Array.isArray(daily?.time) ||
      !Array.isArray(daily?.precipitation_sum) ||
      !Array.isArray(daily?.temperature_2m_max) ||
      daily.time.length !== 7 ||
      daily.precipitation_sum.length !== 7 ||
      daily.temperature_2m_max.length !== 7
    ) {
      throw new Error('Weather provider returned an incomplete forecast');
    }

    return daily.time.map((date, i) => {
      const rain = Number(daily.precipitation_sum[i]);
      const temp = Number(daily.temperature_2m_max[i]);
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date) || !Number.isFinite(rain) || !Number.isFinite(temp)) {
        throw new Error('Weather provider returned invalid forecast values');
      }
      return { date, rain_mm: rain, temp_c: temp };
    });
  } catch {
    throw new ApiError(503, 'WEATHER_UNAVAILABLE', 'Weather data is not available right now.');
  }
}
