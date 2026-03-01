import { z } from 'zod';

export const createBoardSchema = z.object({
  title: z
    .string()
    .min(2, 'Board title must be at least 2 characters')
    .max(100, 'Board title must be at most 100 characters'),
  template: z.enum([
    'mad_sad_glad',
    'start_stop_continue',
    '4ls',
    'kalm',
    'sailboat',
    'custom',
  ]),
  maxVotes: z.number().min(1).max(99),
  customColumns: z
    .array(
      z.object({
        title: z.string().min(1),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .optional(),
});

export type CreateBoardFormData = z.infer<typeof createBoardSchema>;

export const createCardSchema = z.object({
  content: z
    .string()
    .min(1, 'Card content is required')
    .max(500, 'Card content must be at most 500 characters'),
});

export type CreateCardFormData = z.infer<typeof createCardSchema>;
