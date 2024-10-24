import { z } from 'zod';

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image_url: z.string(),
  created_at: z.string(),
  deleted_at: z.string()
});

export type CategoryInterface = z.infer<typeof categorySchema>;