import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { NotFoundError } from '../shared/errors.js';

export const testRouter = Router();

testRouter.get('/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

const echoSchema = z.object({
  message: z.string().min(1).max(500),
});

testRouter.post(
  '/echo',
  asyncHandler(async (req, res) => {
    const body = echoSchema.parse(req.body);
    res.json({ echo: body.message, receivedAt: new Date().toISOString() });
  }),
);

testRouter.get(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const items: Record<number, { id: number; name: string }> = {
      1: { id: 1, name: 'Alpha' },
      2: { id: 2, name: 'Beta' },
    };
    const item = items[id];
    if (!item) throw new NotFoundError(`Item ${id} not found`);
    res.json(item);
  }),
);
