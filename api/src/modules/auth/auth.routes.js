import { Router } from 'express';
import * as controller from './auth.controller.js';
import { loginSchema, refreshSchema, registerSchema } from './auth.validation.js';
import { validate } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();
router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.post('/logout', validate(refreshSchema), controller.logout);
export default router;
