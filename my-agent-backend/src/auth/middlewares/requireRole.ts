import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors.js';
import type { Role } from '../constants.js';

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role as Role)) {
      return next(new ForbiddenError(`Requires one of roles: ${roles.join(', ')}`));
    }
    next();
  };
