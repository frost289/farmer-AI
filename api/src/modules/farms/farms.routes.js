import { Router } from 'express';
import * as controller from './farms.controller.js';
import { farmSchema } from './farms.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { idParamSchema, paginationSchema } from '../../utils/schemas.js';

const router = Router();
router.use(authenticate);
router.get('/', validate(paginationSchema, 'query'), controller.list);
router.post('/', validate(farmSchema), controller.create);
router.get('/:id', validate(idParamSchema, 'params'), controller.get);
router.put('/:id', validate(idParamSchema, 'params'), validate(farmSchema), controller.update);
router.delete('/:id', validate(idParamSchema, 'params'), controller.remove);
export default router;
