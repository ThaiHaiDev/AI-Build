import { z } from 'zod';
import { ENVIRONMENTS } from '../../database/models/TestAccount.js';

const envEnum = z.enum(ENVIRONMENTS as [string, ...string[]]).transform((v) => v as import('../../database/models/TestAccount.js').Environment);

export const createTestAccountSchema = z.object({
  environment: envEnum,
  label:       z.string().trim().min(1, 'Label is required').max(200),
  username:    z.string().trim().min(1, 'Username is required').max(320),
  password:    z.string().min(1, 'Password is required'),
  url:         z.string().url().max(500).optional().nullable().or(z.literal('')).transform((v) => (!v ? null : v)),
  note:        z.string().max(5000).optional().nullable().transform((v) => v ?? null),
});

export const updateTestAccountSchema = createTestAccountSchema.partial();

export type CreateTestAccountBody = z.infer<typeof createTestAccountSchema>;
export type UpdateTestAccountBody = z.infer<typeof updateTestAccountSchema>;
