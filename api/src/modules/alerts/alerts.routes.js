import { Router } from 'express';
import * as controller from './alerts.controller.js';
import { createAlertSchema } from './alerts.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { OFFICER_ROLES } from '../../utils/constants.js';

const router = Router();
router.use(authenticate);
router.get('/', controller.list);
router.post('/', authorize(...OFFICER_ROLES), validate(createAlertSchema), controller.create);
export default router;
