import * as service from './farms.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await service.list(req.user, req.query);
  send(res, rows, { meta });
});
export const create = asyncHandler(async (req, res) =>
  send(res, await service.create(req.user, req.body), { status: 201 }),
);
export const get = asyncHandler(async (req, res) =>
  send(res, await service.getAccessibleFarm(req.params.id, req.user)),
);
export const update = asyncHandler(async (req, res) =>
  send(res, await service.update(req.params.id, req.user, req.body)),
);
export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user);
  res.status(204).end();
});
