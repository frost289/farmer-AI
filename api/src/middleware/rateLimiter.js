import rateLimit from 'express-rate-limit';

const handler = (req, res) =>
  res.status(429).json({
    error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again later.', request_id: req.id },
  });

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
