import { z } from 'zod';

export const ratificationSchema = z.object({
  group_id:z.number(), 
  election_id:z.number(),
  user_id: z.number(),
  is_ratified: z.boolean()
})

export type RatificationInterface = z.infer<typeof ratificationSchema >