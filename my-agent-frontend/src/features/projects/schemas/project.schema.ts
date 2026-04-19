import { z } from 'zod'

const optionalString = (max: number) => z.string().trim().max(max).optional().default('')

export const projectFormSchema = z.object({
  name:               z.string().trim().min(1).max(200),
  description:        optionalString(5000),
  techStack:          optionalString(2000),
  partnerName:        optionalString(200),
  partnerContactName: optionalString(100),
  partnerEmail: z
    .string()
    .trim()
    .max(320)
    .optional()
    .default('')
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: 'Invalid email' }),
  partnerPhone:       optionalString(30),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export function normalizeProjectForm(v: ProjectFormValues) {
  const toNull = (s?: string) => (s && s.trim() !== '' ? s.trim() : null)
  return {
    name:               v.name.trim(),
    description:        toNull(v.description),
    techStack:          toNull(v.techStack),
    partnerName:        toNull(v.partnerName),
    partnerContactName: toNull(v.partnerContactName),
    partnerEmail:       toNull(v.partnerEmail),
    partnerPhone:       toNull(v.partnerPhone),
  }
}
