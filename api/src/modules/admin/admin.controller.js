import * as service from './admin.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { send } from '../../utils/respond.js';

export const stats = asyncHandler(async (_req, res) => send(res, await service.stats()));
