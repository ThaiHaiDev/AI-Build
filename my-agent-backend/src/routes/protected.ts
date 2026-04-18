import { Router } from 'express';
import { requireAuth, requireRole, requirePermission, ROLES, PERMISSIONS } from '../auth/index.js';

export const protectedRouter = Router();

// Cần đăng nhập
protectedRouter.get('/profile', requireAuth, (req, res) => {
  res.json({ user: req.user, message: 'This is your profile' });
});

// Cần role admin hoặc super_admin
protectedRouter.get('/admin-only', requireAuth, requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), (_req, res) => {
  res.json({ message: 'Welcome admin' });
});

// Cần permission user:manage
protectedRouter.get('/user-manage', requireAuth, requirePermission(PERMISSIONS.USER_MANAGE), (_req, res) => {
  res.json({ message: 'You can manage users' });
});
