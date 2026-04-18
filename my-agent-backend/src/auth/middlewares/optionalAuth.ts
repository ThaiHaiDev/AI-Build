import type { RequestHandler } from 'express';
import { TokenService } from '../services/TokenService.js';
import { revokedTokenStore } from '../stores/revokedTokenStore.js';

/** Attach req.user nếu có token hợp lệ; không throw nếu thiếu/sai. */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const payload = TokenService.verifyAccess(header.slice('Bearer '.length));
    if (await revokedTokenStore.isRevoked(payload.jti)) return next();
    req.user = { id: payload.sub, email: payload.email, role: payload.role, jti: payload.jti };
  } catch {
    // ignore — giữ req.user undefined
  }
  next();
};
