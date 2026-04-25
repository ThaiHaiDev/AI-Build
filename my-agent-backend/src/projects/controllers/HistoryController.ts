import type { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors.js';
import { historyStore } from '../stores/historyStore.js';
import { historyQuerySchema } from '../schemas/history.schema.js';
import { isAtLeast, ROLES } from '../../auth/constants.js';
import type { Role } from '../../auth/constants.js';

export const HistoryController = {
  listByProject: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    if (!isAtLeast(req.user.role as Role, ROLES.ADMIN)) {
      throw new ForbiddenError('Only admins can view project history');
    }
    const q = historyQuerySchema.parse(req.query);
    const result = await historyStore.listByProject(req.params.id!, {
      resourceType: q.resourceType,
      action:       q.action,
      from:         q.from ? new Date(q.from) : undefined,
      to:           q.to   ? new Date(q.to)   : undefined,
      page:         q.page,
      limit:        q.limit,
    });
    res.json(result);
  }),

  listGlobal: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const q = historyQuerySchema.parse(req.query);
    const result = await historyStore.listGlobal({
      resourceType: q.resourceType,
      action:       q.action,
      actorId:      q.actorId,
      projectId:    q.projectId,
      from:         q.from ? new Date(q.from) : undefined,
      to:           q.to   ? new Date(q.to)   : undefined,
      page:         q.page,
      limit:        q.limit,
    });
    res.json(result);
  }),
};
