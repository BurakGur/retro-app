import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(50, 'Team name must be at most 50 characters'),
});

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(50, 'Team name must be at most 50 characters'),
});

export type UpdateTeamFormData = z.infer<typeof updateTeamSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function generateSlug(name: string): string {
  const base = slugify(name);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
