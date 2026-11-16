import { Router } from 'express';
import * as controller from './admin.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();
router.get('/stats', authenticate, authorize('admin'), controller.stats);
export default router;
