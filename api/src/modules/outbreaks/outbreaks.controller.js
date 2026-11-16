import * as service from './outbreaks.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const list = asyncHandler(async (req, res) => send(res, await service.list(req.query)));
