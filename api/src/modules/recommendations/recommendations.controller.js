import * as service from './recommendations.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const crops = asyncHandler(async (req, res) =>
  send(res, await service.cropRecommendations(req.user, req.query.farm_id, req.id)),
);
export const readiness = asyncHandler(async (req, res) =>
  send(res, await service.plantingReadiness(req.user, req.query.farm_id, req.query.crop, req.id)),
);
