import * as service from './diagnoses.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const create = asyncHandler(async (req, res) =>
  send(res, await service.create(req.user, req.body, req.file, req.id), { status: 202 }),
);
export const get = asyncHandler(async (req, res) =>
  send(res, await service.get(req.params.id, req.user)),
);
export const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await service.list(req.user, req.query);
  send(res, rows, { meta });
});
