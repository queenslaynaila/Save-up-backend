import { z } from 'zod';

export const groupsSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  creator_id: z.number().int().min(1),
  created_at: z.string(),
  deleted_at: z.string().optional()
});
export type Group = z.infer<typeof groupsSchema>;