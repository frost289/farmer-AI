import { Router } from 'express';
import * as controller from './weather.controller.js';
import { weatherQuerySchema } from './weather.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { OFFICER_ROLES } from '../../utils/constants.js';

const router = Router();
router.use(authenticate);
router.get('/', validate(weatherQuerySchema, 'query'), controller.get);
router.get('/heatmap', authorize(...OFFICER_ROLES), controller.heatmap);
export default router;
