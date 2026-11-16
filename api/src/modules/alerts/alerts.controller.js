import * as service from './alerts.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const list = asyncHandler(async (req, res) =>
  send(res, await service.listForUser(req.user)),
);
export const create = asyncHandler(async (req, res) =>
  send(res, await service.create(req.user, req.body), { status: 201 }),
);
