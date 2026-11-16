import { ApiError } from '../utils/ApiError.js';
import { verifyAccess } from '../utils/token.js';

export function authenticate(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'UNAUTHORIZED', 'Missing token');
  let payload;
  try {
    payload = verifyAccess(token);
  } catch {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
  req.user = { id: payload.sub, role: payload.role };
  next();
}
