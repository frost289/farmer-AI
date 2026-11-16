import crypto from 'node:crypto';

export function requestId(req, res, next) {
  req.id = req.get('X-Request-ID') || crypto.randomUUID();
  res.set('X-Request-ID', req.id);
  next();
}
