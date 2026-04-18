import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors.js';
import { ROLE_PERMISSIONS, type Permission, type Role } from '../constants.js';

export const requirePermission =
  (...required: Permission[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    const granted = ROLE_PERMISSIONS[req.user.role as Role];
    const ok = required.every((p) => granted.includes(p));
    if (!ok) return next(new ForbiddenError(`Requires permissions: ${required.join(', ')}`));
    next();
  };
