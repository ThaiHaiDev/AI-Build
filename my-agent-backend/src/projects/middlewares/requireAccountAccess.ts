import type { RequestHandler } from 'express';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../../shared/errors.js';
import { ROLES, isAtLeast } from '../../auth/constants.js';
import { projectStore } from '../stores/projectStore.js';
import { projectMemberStore } from '../stores/projectMemberStore.js';

/**
 * Confirms the caller is an active project member (or SA).
 * Attaches req.memberRole = 'admin' | 'user' for downstream write-gating.
 */
export const requireAccountAccess: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.user) throw new UnauthorizedError();

    const projectId = req.params.id;
    if (!projectId) throw new NotFoundError('Project not found');

    const project = await projectStore.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    if (req.user.role === ROLES.SUPER_ADMIN) {
      req.memberRole = 'admin';
      return next();
    }

    const ok = await projectMemberStore.isActiveMember(projectId, req.user.id);
    if (!ok) throw new ForbiddenError('You do not have access to this project');

    req.memberRole = isAtLeast(req.user.role, ROLES.ADMIN) ? 'admin' : 'user';
    next();
  } catch (err) {
    next(err);
  }
};
