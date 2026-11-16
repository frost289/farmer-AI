import { Router } from 'express';
import * as controller from './outbreaks.controller.js';
import { outbreakQuerySchema } from './outbreaks.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { OFFICER_ROLES } from '../../utils/constants.js';

const router = Router();
router.get(
  '/',
  authenticate,
  authorize(...OFFICER_ROLES),
  validate(outbreakQuerySchema, 'query'),
  controller.list,
);
export default router;
