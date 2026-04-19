import { Router } from 'express';
import { requireAuth } from '../auth/middlewares/requireAuth.js';
import { requireRole } from '../auth/middlewares/requireRole.js';
import { ROLES } from '../auth/constants.js';
import { ProjectController } from './controllers/ProjectController.js';
import { UserController } from './controllers/UserController.js';
import { requireProjectAccess } from './middlewares/requireProjectAccess.js';
import { projectWriteLimiter } from './middlewares/projectRateLimiter.js';

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

const superAdmin = requireRole(ROLES.SUPER_ADMIN);

// Projects
projectsRouter.get('/projects', ProjectController.list);
projectsRouter.post('/projects', superAdmin, projectWriteLimiter, ProjectController.create);
projectsRouter.get('/projects/:id', requireProjectAccess, ProjectController.getById);
projectsRouter.patch('/projects/:id', superAdmin, ProjectController.update);
projectsRouter.post('/projects/:id/archive', superAdmin, ProjectController.archive);
projectsRouter.post('/projects/:id/unarchive', superAdmin, ProjectController.unarchive);

// Members
projectsRouter.get('/projects/:id/members', requireProjectAccess, ProjectController.listMembers);
projectsRouter.post('/projects/:id/members', superAdmin, projectWriteLimiter, ProjectController.addMember);
projectsRouter.delete('/projects/:id/members/:userId', superAdmin, ProjectController.removeMember);

// Users (search for add-member modal)
projectsRouter.get('/users', superAdmin, UserController.search);
