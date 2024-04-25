import { z } from 'zod';

export const nominateParamsSchema = z.object({
  group_id: z.string(),
  nominated_member_id: z.string(),
});
  
export type NominateParamsInterface = z.infer<typeof nominateParamsSchema>;
  
export const voteSChema = z.object({
  vote:z.boolean()
})
  
export type VoteInterface = z.infer<typeof voteSChema>;

export const nominatedAdminSchema = z.object({
  user_id: z.number(),
  group_id: z.number(),
  full_name: z.string(),
  nominated_at: z.date()
})

export type NominatedAdminInterface = z.infer<typeof nominatedAdminSchema>;

export const approveAdminSchema = z.object({
  group_id: z.number(),
  nominated_member_id: z.number(),
  voter_member_id: z.number(),
  vote: z.boolean()
})

export type ApproveAdminInterface = z.infer<typeof approveAdminSchema>;

export const proposeAdminSchema = nominatedAdminSchema.pick({
  user_id: true,
  group_id: true,
})

export type ProposeAdminInterface = z.infer<typeof proposeAdminSchema>;

export const userSchema = proposeAdminSchema.pick({
  user_id: true,
})

export type UserInterface = z.infer<typeof userSchema>;

export const groupSchema = nominateParamsSchema.pick({
  group_id: true,
})

export type GroupInterface = z.infer<typeof groupSchema>;

export const getNominatedMember = nominatedAdminSchema.pick({
  group_id: true
})

export type GetNominatedMemberInterface = z.infer<typeof getNominatedMember>;