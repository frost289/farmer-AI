import * as service from './public.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const ask = asyncHandler(async (req, res) => send(res, await service.ask(req.body, req.id)));
