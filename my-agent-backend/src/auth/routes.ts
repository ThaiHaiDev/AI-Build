import { Router } from 'express';
import { AuthController } from './controllers/AuthController.js';
import { AdminController } from './controllers/AdminController.js';
import { MeController } from './controllers/MeController.js';
import { requireAuth } from './middlewares/requireAuth.js';
import { requireRole } from './middlewares/requireRole.js';
import { ROLES } from './constants.js';
import { authRateLimiter } from './middlewares/authRateLimiter.js';

export const authRouter = Router();

const superAdmin = requireRole(ROLES.SUPER_ADMIN);

authRouter.post('/register', AuthController.register);
authRouter.post('/login',    authRateLimiter, AuthController.login);
authRouter.post('/refresh',  AuthController.refresh);
authRouter.post('/logout',   requireAuth, AuthController.logout);
authRouter.get ('/me',       requireAuth, AuthController.me);

// Me — self-service profile updates
authRouter.patch('/me',          requireAuth, MeController.updateName);
authRouter.patch('/me/password', requireAuth, MeController.changePassword);

// Admin — user management (SA only)
authRouter.get   ('/admin/users',                   requireAuth, superAdmin, AdminController.listUsers);
authRouter.post  ('/admin/users',                   requireAuth, superAdmin, AdminController.createUser);
authRouter.patch ('/admin/users/:userId/role',       requireAuth, superAdmin, AdminController.changeRole);
authRouter.patch ('/admin/users/:userId/deactivate', requireAuth, superAdmin, AdminController.deactivate);
