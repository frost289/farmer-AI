import { Router } from 'express';
import * as controller from './plantings.controller.js';
import { plantingSchema } from './plantings.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { idParamSchema } from '../../utils/schemas.js';

// Mounted at /farms/:id/plantings
const router = Router({ mergeParams: true });
router.use(authenticate, validate(idParamSchema, 'params'));
router.get('/', controller.list);
router.post('/', validate(plantingSchema), controller.create);
export default router;
