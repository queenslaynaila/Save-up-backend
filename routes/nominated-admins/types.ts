import { z } from 'zod';

export const nominatedAdminSchema = z.object({
  nominee_id  : z.number(),
  group_id: z.number(),
  nominator_id: z.number(),
  full_name: z.string(),
  created_at: z.date()
})

export type NominatedAdminInterface = z.infer<typeof nominatedAdminSchema>;

export const proposeAdminSchema = nominatedAdminSchema.pick({
  nominee_id  : true,
  group_id: true,
  nominator_id: true,
}).extend({
  election_id: z.number()
})
  
export type ProposeAdminInterface = z.infer<typeof proposeAdminSchema>;

export const userSchema = z.object({
  user_id: z.number()
})
  
