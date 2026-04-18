import { Router } from 'express';
import { healthRouter } from './health.js';
import { testRouter } from './test.js';
import { protectedRouter } from './protected.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/test', testRouter);
apiRouter.use('/', protectedRouter);
