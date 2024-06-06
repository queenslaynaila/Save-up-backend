import { z } from 'zod';

export const proposeAdminSchema = z.object({
  user_id: z.number(),
  group_id: z.number(),
})
  
export type ProposeAdminInterface = z.infer<typeof proposeAdminSchema>;

export const userSchema = proposeAdminSchema.pick({
  user_id: true,
})
  
export type UserInterface = z.infer<typeof userSchema>;