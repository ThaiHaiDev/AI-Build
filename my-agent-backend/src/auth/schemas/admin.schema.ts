import { z } from 'zod';
import { ROLES } from '../constants.js';

const MANAGEABLE_ROLES = [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN] as const;

export const listUsersQuerySchema = z.object({
  role:     z.enum([ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN]).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search:   z.string().trim().min(1).max(100).optional(),
});

export const createUserSchema = z.object({
  email:    z.string().email().max(320).transform((v) => v.toLowerCase()),
  name:     z.string().trim().min(1).max(100),
  password: z.string().min(8).max(128),
  role:     z.enum(MANAGEABLE_ROLES).default(ROLES.USER),
});

export const changeRoleSchema = z.object({
  role: z.enum(MANAGEABLE_ROLES),
});

export const updateNameSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).max(128),
});
