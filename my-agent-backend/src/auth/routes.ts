import { Router } from 'express';
import { AuthController } from './controllers/AuthController.js';
import { requireAuth } from './middlewares/requireAuth.js';
import { authRateLimiter } from './middlewares/authRateLimiter.js';

export const authRouter = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login',    authRateLimiter, AuthController.login);
authRouter.post('/refresh',  AuthController.refresh);
authRouter.post('/logout',   requireAuth, AuthController.logout);
authRouter.get ('/me',       requireAuth, AuthController.me);
