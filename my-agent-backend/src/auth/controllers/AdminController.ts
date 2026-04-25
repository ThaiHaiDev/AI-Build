import type { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ConflictError, NotFoundError, SelfActionForbiddenError, UnauthorizedError } from '../../shared/errors.js';
import { userStore } from '../stores/userStore.js';
import { refreshTokenStore } from '../stores/refreshTokenStore.js';
import { toPublicUser } from '../utils/toPublicUser.js';
import { changeRoleSchema, createUserSchema, listUsersQuerySchema } from '../schemas/admin.schema.js';
import type { Role } from '../constants.js';
import { historyStore } from '../../projects/stores/historyStore.js';

export const AdminController = {
  listUsers: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const q = listUsersQuerySchema.parse(req.query);
    const isActive = q.isActive === undefined ? undefined : q.isActive === 'true';
    const users = await userStore.listAll({ role: q.role as Role | undefined, isActive, search: q.search });
    res.json({ users: users.map(toPublicUser) });
  }),

  createUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const body = createUserSchema.parse(req.body);
    const existing = await userStore.findByEmail(body.email);
    if (existing) throw new ConflictError('Email already registered');
    const user = await userStore.create(body);
    historyStore.append({
      actorId:      req.user.id,
      actorName:    req.user.email,
      actorEmail:   req.user.email,
      action:       'create',
      resourceType: 'user',
      resourceId:   user.id,
      resourceName: user.email,
    });
    res.status(201).json({ user: toPublicUser(user) });
  }),

  changeRole: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const targetId = req.params.userId!;
    if (targetId === req.user.id) throw new SelfActionForbiddenError('Cannot change your own role');
    const { role } = changeRoleSchema.parse(req.body);
    const updated = await userStore.changeRole(targetId, role);
    if (!updated) throw new NotFoundError('User not found');
    historyStore.append({
      actorId:      req.user.id,
      actorName:    req.user.email,
      actorEmail:   req.user.email,
      action:       'change_role',
      resourceType: 'user',
      resourceId:   targetId,
      resourceName: updated.email,
      meta: { after: { role } },
    });
    res.json({ user: toPublicUser(updated) });
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const targetId = req.params.userId!;
    if (targetId === req.user.id) throw new SelfActionForbiddenError('Cannot deactivate your own account');
    const updated = await userStore.deactivate(targetId);
    if (!updated) throw new NotFoundError('User not found');
    await refreshTokenStore.revokeUser(targetId);
    historyStore.append({
      actorId:      req.user.id,
      actorName:    req.user.email,
      actorEmail:   req.user.email,
      action:       'deactivate',
      resourceType: 'user',
      resourceId:   targetId,
      resourceName: updated.email,
    });
    res.json({ user: toPublicUser(updated) });
  }),
};
