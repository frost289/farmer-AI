import * as repo from './weather.repository.js';
import { fetchForecast } from '../../integrations/weatherClient.js';
import { ApiError } from '../../utils/ApiError.js';
import { LIMITS } from '../../utils/constants.js';
import { getAccessibleFarm } from '../farms/farms.service.js';

const round2 = (n) => Math.round(Number(n) * 100) / 100;

/** 7-day forecast, cached for 3 hours per rounded coordinate. Falls back to stale cache. */
export async function getForecast(lat, lng) {
  const [rLat, rLng] = [round2(lat), round2(lng)];
  const cached = await repo.findCache(rLat, rLng);
  const ageMs = cached ? Date.now() - new Date(cached.fetched_at).getTime() : Infinity;
  if (cached && ageMs < LIMITS.weatherCacheHours * 3600 * 1000) return cached;
  try {
    return await repo.saveCache(rLat, rLng, await fetchForecast(rLat, rLng));
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

export async function getFarmWeather(farmId, user) {
  const farm = await getAccessibleFarm(farmId, user);
  if (farm.lat == null || farm.lng == null) {
    throw ApiError.badRequest('Set the farm location (lat, lng) to use weather features', [
      { field: 'farm_id', issue: 'Farm has no location' },
    ]);
  }
  const { forecast, fetched_at: fetchedAt } = await getForecast(farm.lat, farm.lng);
  return { farm, location: { lat: farm.lat, lng: farm.lng }, forecast_7d: forecast, fetched_at: fetchedAt };
}

export async function getHeatmap() {
  const districts = await repo.districtCentroids();
  const results = await Promise.allSettled(districts.map((d) => getForecast(d.lat, d.lng)));
  return districts.flatMap((d, i) => {
    if (results[i].status !== 'fulfilled') return [];
    const days = results[i].value.forecast;
    return [
      {
        district: d.district,
        rain_mm: round2(days.reduce((sum, x) => sum + x.rain_mm, 0)),
        temp_c: round2(days.reduce((sum, x) => sum + x.temp_c, 0) / days.length),
      },
    ];
  });
}
