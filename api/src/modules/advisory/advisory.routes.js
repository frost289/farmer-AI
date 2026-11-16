import { Router } from 'express';
import * as controller from './advisory.controller.js';
import { askSchema } from './advisory.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';

const router = Router();
router.post('/ask', authenticate, validate(askSchema), controller.ask);
export default router;
