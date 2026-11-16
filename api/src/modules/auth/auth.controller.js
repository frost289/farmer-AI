import * as service from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const register = asyncHandler(async (req, res) =>
  send(res, await service.register(req.body), { status: 201 }),
);
export const login = asyncHandler(async (req, res) => send(res, await service.login(req.body)));
export const refresh = asyncHandler(async (req, res) =>
  send(res, await service.refresh(req.body.refresh_token)),
);
export const logout = asyncHandler(async (req, res) => {
  await service.logout(req.body.refresh_token);
  res.status(204).end();
});
