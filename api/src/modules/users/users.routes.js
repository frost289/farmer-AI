import { Router } from 'express';
import * as controller from './users.controller.js';
import { roleSchema, updateMeSchema } from './users.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { idParamSchema, paginationSchema } from '../../utils/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/me', controller.getMe);
router.put('/me', validate(updateMeSchema), controller.updateMe);
router.get('/', authorize('admin'), validate(paginationSchema, 'query'), controller.list);
router.put(
  '/:id/role',
  authorize('admin'),
  validate(idParamSchema, 'params'),
  validate(roleSchema),
  controller.changeRole,
);
export default router;
