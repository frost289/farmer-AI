import * as service from './weather.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const get = asyncHandler(async (req, res) => {
  const { location, forecast_7d: forecast, fetched_at: fetchedAt } = await service.getFarmWeather(
    req.query.farm_id,
    req.user,
  );
  send(res, { location, forecast_7d: forecast, fetched_at: fetchedAt });
});
export const heatmap = asyncHandler(async (_req, res) => send(res, await service.getHeatmap()));
