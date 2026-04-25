import type { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../../shared/errors.js';
import { projectStore } from '../stores/projectStore.js';
import { projectMemberStore } from '../stores/projectMemberStore.js';
import { userStore } from '../../auth/stores/userStore.js';
import {
  addMemberSchema,
  createProjectSchema,
  envAccessSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from '../schemas/project.schema.js';
import { ROLES, isAtLeast } from '../../auth/constants.js';
import type { Role } from '../../auth/constants.js';
import { EnvAccessForbiddenError, ForbiddenError } from '../../shared/errors.js';

export const ProjectController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const q = listProjectsQuerySchema.parse(req.query);
    const projects = await projectStore.listForUser(req.user.id, req.user.role as Role, {
      includeArchived: q.includeArchived === 'true',
    });
    res.json({ projects });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectStore.findById(req.params.id!);
    if (!project) throw new NotFoundError('Project not found');
    res.json({ project });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const body = createProjectSchema.parse(req.body);
    const dup = await projectStore.findByNameCI(body.name);
    if (dup) throw new ConflictError('Project name already exists');
    const project = await projectStore.create(body, req.user.id);
    res.status(201).json({ project });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id!;
    const existing = await projectStore.findById(id);
    if (!existing) throw new NotFoundError('Project not found');
    if (existing.status === 'archived') throw new ConflictError('Cannot edit an archived project');

    const body = updateProjectSchema.parse(req.body);
    if (body.name !== undefined) {
      const dup = await projectStore.findByNameCI(body.name, id);
      if (dup) throw new ConflictError('Project name already exists');
    }
    const project = await projectStore.update(id, body);
    res.json({ project });
  }),

  archive: asyncHandler(async (req: Request, res: Response) => {
    const existing = await projectStore.findById(req.params.id!);
    if (!existing) throw new NotFoundError('Project not found');
    if (existing.status === 'archived') throw new ConflictError('Project already archived');
    const project = await projectStore.archive(req.params.id!);
    res.json({ project });
  }),

  unarchive: asyncHandler(async (req: Request, res: Response) => {
    const existing = await projectStore.findById(req.params.id!);
    if (!existing) throw new NotFoundError('Project not found');
    if (existing.status === 'active') throw new ConflictError('Project is not archived');
    const project = await projectStore.unarchive(req.params.id!);
    res.json({ project });
  }),

  listMembers: asyncHandler(async (req: Request, res: Response) => {
    const members = await projectMemberStore.listMembers(req.params.id!);
    res.json({ members });
  }),

  addMember: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const projectId = req.params.id!;
    const body = addMemberSchema.parse(req.body);
    const { userId } = body;

    const project = await projectStore.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');
    if (project.status === 'archived') throw new ConflictError('Cannot modify members of an archived project');

    const user = await userStore.findById(userId);
    if (!user) throw new ValidationError('User not found');

    const alreadyMember = await projectMemberStore.isActiveMember(projectId, userId);
    if (alreadyMember) throw new ConflictError('User is already a member');

    await projectMemberStore.addMember(projectId, userId, req.user.id, body.allowedEnvs);
    const members = await projectMemberStore.listMembers(projectId);
    res.status(201).json({ members });
  }),

  removeMember: asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id!;
    const userId = req.params.userId!;
    const project = await projectStore.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');
    if (project.status === 'archived') throw new ConflictError('Cannot modify members of an archived project');

    const ok = await projectMemberStore.removeMember(projectId, userId);
    if (!ok) throw new NotFoundError('Member not found in this project');
    const members = await projectMemberStore.listMembers(projectId);
    res.json({ members });
  }),

  updateEnvAccess: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    if (!isAtLeast(req.user.role as Role, ROLES.ADMIN)) {
      throw new ForbiddenError('Only admins can update environment access');
    }
    const projectId  = req.params.id!;
    const memberId   = req.params.memberId!;
    const { allowedEnvs } = envAccessSchema.parse(req.body);

    // Admin cannot grant envs beyond their own allowedEnvs
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      const actorMember = await projectMemberStore.getActiveMember(projectId, req.user.id);
      if (!actorMember) throw new NotFoundError('Project not found');
      const forbidden = allowedEnvs.filter((e) => !actorMember.allowedEnvs.includes(e));
      if (forbidden.length > 0) {
        throw new EnvAccessForbiddenError(`Cannot grant environments you do not have access to: ${forbidden.join(', ')}`);
      }
    }

    const updated = await projectMemberStore.updateEnvAccess(projectId, memberId, allowedEnvs);
    if (!updated) throw new NotFoundError('Member not found in this project');
    res.json({ member: updated });
  }),
};
