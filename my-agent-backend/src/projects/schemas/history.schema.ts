import { z } from 'zod';
import { HISTORY_RESOURCE_TYPES } from '../../database/models/History.js';

export const historyQuerySchema = z.object({
  resourceType: z.enum(HISTORY_RESOURCE_TYPES).optional(),
  action:       z.string().max(50).optional(),
  actorId:      z.string().uuid().optional(),
  projectId:    z.string().uuid().optional(),
  from:         z.string().datetime({ offset: true }).optional(),
  to:           z.string().datetime({ offset: true }).optional(),
  page:         z.coerce.number().int().min(1).default(1),
  limit:        z.coerce.number().int().min(1).max(100).default(20),
});
