import * as service from './plantings.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const list = asyncHandler(async (req, res) =>
  send(res, await service.list(req.params.id, req.user)),
);
export const create = asyncHandler(async (req, res) =>
  send(res, await service.create(req.params.id, req.user, req.body), { status: 201 }),
);
