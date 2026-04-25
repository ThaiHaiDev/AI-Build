import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../../shared/errors.js';
import { TokenService } from '../services/TokenService.js';
import { revokedTokenStore } from '../stores/revokedTokenStore.js';
import { userStore } from '../stores/userStore.js';

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Missing Bearer token');

    const token = header.slice('Bearer '.length);
    let payload;
    try { payload = TokenService.verifyAccess(token); }
    catch { throw new UnauthorizedError('Invalid or expired token'); }

    if (await revokedTokenStore.isRevoked(payload.jti)) {
      throw new UnauthorizedError('Token revoked');
    }

    const user = await userStore.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Account deactivated');
    }

    req.user = {
      id:    payload.sub,
      email: payload.email,
      role:  payload.role,
      jti:   payload.jti,
    };
    next();
  } catch (err) {
    next(err);
  }
};
