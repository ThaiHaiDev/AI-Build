import type { RequestHandler } from 'express';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../../shared/errors.js';
import { ROLES, isAtLeast } from '../../auth/constants.js';
import { ALL_ENVS } from '../../database/models/ProjectMember.js';
import { projectStore } from '../stores/projectStore.js';
import { projectMemberStore } from '../stores/projectMemberStore.js';

/**
 * Confirms the caller is an active project member (or SA).
 * Attaches req.memberRole = 'admin' | 'user' and req.memberEnvs for downstream env-level gating.
 * SA bypasses env restrictions and always gets all envs.
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
      req.memberEnvs = [...ALL_ENVS];
      return next();
    }

    const member = await projectMemberStore.getActiveMember(projectId, req.user.id);
    if (!member) throw new ForbiddenError('You do not have access to this project');

    req.memberRole = isAtLeast(req.user.role, ROLES.ADMIN) ? 'admin' : 'user';
    req.memberEnvs = member.allowedEnvs;
    next();
  } catch (err) {
    next(err);
  }
};
