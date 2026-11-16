import * as service from './users.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const getMe = asyncHandler(async (req, res) => send(res, await service.getMe(req.user.id)));
export const updateMe = asyncHandler(async (req, res) =>
  send(res, await service.updateMe(req.user.id, req.body)),
);
export const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await service.list(req.query);
  send(res, rows, { meta });
});
export const changeRole = asyncHandler(async (req, res) =>
  send(res, await service.changeRole(req.params.id, req.body.role)),
);
