import { Router } from 'express';
import * as controller from './recommendations.controller.js';
import { cropRecsQuery, readinessQuery } from './recommendations.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';

// Mounted at '/': serves /recommendations/crops and /planting-readiness
const router = Router();
router.get('/recommendations/crops', authenticate, validate(cropRecsQuery, 'query'), controller.crops);
router.get('/planting-readiness', authenticate, validate(readinessQuery, 'query'), controller.readiness);
export default router;
