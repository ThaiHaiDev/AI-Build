import { Router } from 'express';
import { config } from '../config/index.js';
import { sequelize } from '../database/sequelize.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const healthRouter = Router();

healthRouter.get('/db/ping', asyncHandler(async (_req, res) => {
  const [rows] = await sequelize.query('SELECT version() AS version, now() AS now');
  res.json({ ok: true, db: rows[0] });
}));

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: config.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/ready', (_req, res) => {
  res.json({ status: 'ready' });
});
