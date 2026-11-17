import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from './public.controller.js';
import { publicAskSchema } from './public.validation.js';
import { validate } from '../../middleware/validate.js';

// Open to everyone, so limit it per IP to protect the AI service.
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
    max: 30,
      standardHeaders: true,
        legacyHeaders: false,
          handler: (req, res) =>
              res.status(429).json({
                    error: { code: 'RATE_LIMITED', message: 'Too many questions. Please wait a few minutes.', request_id: req.id },
                        }),
                        });

                        const router = Router();
                        router.post('/ask', publicLimiter, validate(publicAskSchema), controller.ask);
                        export default router;
                        