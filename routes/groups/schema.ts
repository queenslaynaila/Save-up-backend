import { z } from 'zod';

export const groupsSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  creator_id: z.number().int(),
  created_at: z.string().datetime(),
  deleted_at: z.string().date().optional()
});
export type Group = z.infer<typeof groupsSchema>;