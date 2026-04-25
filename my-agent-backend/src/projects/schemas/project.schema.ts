import { z } from 'zod';

const optionalText = (max: number) =>
  z.string().max(max).optional().nullable().transform((v) => (v === '' ? null : v ?? null));

const optionalEmail = () =>
  z.string().email().max(320).optional().nullable().or(z.literal('')).transform((v) => {
    if (v === '' || v === undefined || v === null) return null;
    return v;
  });

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(200),
  description:        optionalText(5000),
  techStack:          optionalText(2000),
  partnerName:        optionalText(200),
  partnerContactName: optionalText(100),
  partnerEmail:       optionalEmail(),
  partnerPhone:       optionalText(30),
});

export const updateProjectSchema = createProjectSchema.partial();

const VALID_ENVS = ['dev', 'staging', 'production'] as const;

export const addMemberSchema = z.object({
  userId:      z.string().uuid(),
  allowedEnvs: z
    .array(z.enum(VALID_ENVS))
    .min(1, 'Must allow at least one environment')
    .optional()
    .default(['dev']),
});

export const envAccessSchema = z.object({
  allowedEnvs: z.array(z.enum(VALID_ENVS)).min(1, 'Must allow at least one environment'),
});

export const listProjectsQuerySchema = z.object({
  includeArchived: z.enum(['true', 'false']).optional(),
  search:          z.string().trim().min(1).max(100).optional(),
});

export const searchUsersQuerySchema = z.object({
  search: z.string().trim().min(1).max(100),
});

export type CreateProjectBody = z.infer<typeof createProjectSchema>;
export type UpdateProjectBody = z.infer<typeof updateProjectSchema>;
