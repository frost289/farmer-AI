import * as repo from './recommendations.repository.js';
import * as advisory from '../../integrations/advisoryClient.js';
import { getFarmWeather } from '../weather/weather.service.js';

function contextOf({ farm, location, forecast_7d: forecast }) {
  return {
    location: { ...location, district: farm.district },
    soil_type: farm.soil_type,
    weather: { forecast_7d: forecast },
  };
}

export async function cropRecommendations(user, farmId, requestId) {
  const weather = await getFarmWeather(farmId, user);
  const result = await advisory.recommendCrops(contextOf(weather), requestId);
  await repo.save(farmId, 'crop', result);
  return { recommendations: result.recommendations };
}

export async function plantingReadiness(user, farmId, crop, requestId) {
  const weather = await getFarmWeather(farmId, user);
  const result = await advisory.plantingReadiness({ crop, ...contextOf(weather) }, requestId);
  await repo.save(farmId, 'planting_readiness', { crop, ...result });
  return result;
}
