import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'errors.required')
    .email('errors.email'),
  password: z.string().min(1, 'errors.required'),
  remember: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'errors.required').max(100),
    email: z.string().min(1, 'errors.required').email('errors.email'),
    password: z.string().min(10, 'errors.pwd_short'),
    passwordConfirm: z.string().min(1, 'errors.required'),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'errors.pwd_match',
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export function passwordStrength(p: string): 'weak' | 'medium' | 'strong' {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 1) return 'weak';
  if (s <= 3) return 'medium';
  return 'strong';
}
