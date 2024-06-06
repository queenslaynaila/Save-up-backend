import { z } from 'zod';

export const nominatedAdminSchema = z.object({
  user_id: z.number(),
  group_id: z.number(),
  full_name: z.string(),
  nominated_at: z.date()
})

export type NominatedAdminInterface = z.infer<typeof nominatedAdminSchema>;

export const proposeAdminSchema = nominatedAdminSchema.pick({
  user_id: true,
  group_id: true,
})
  
export type ProposeAdminInterface = z.infer<typeof proposeAdminSchema>;

export const userSchema = proposeAdminSchema.pick({
  user_id: true,
})
  
export type UserInterface = z.infer<typeof userSchema>;