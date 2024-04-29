import { z } from 'zod';

export const nominateParamsSchema = z.object({
  groupId: z.string(),
  nominatedMemberId: z.string(),
});
  
export type NominateParamsInterface = z.infer<typeof nominateParamsSchema>;
  
export const voteSChema = z.object({
  vote:z.boolean()
})
  
export type VoteInterface = z.infer<typeof voteSChema>;

export const nominatedAdminSchema = z.object({
  userId: z.number(),
  groupId: z.number(),
  fullName: z.string(),
  nominatedAt: z.date()
})

export type NominatedAdminInterface = z.infer<typeof nominatedAdminSchema>;

export const approveAdminSchema = z.object({
  groupId: z.number(),
  nominatedMemberId: z.number(),
  voterMemberId: z.number(),
  vote: z.boolean()
})

export type ApproveAdminInterface = z.infer<typeof approveAdminSchema>;

export const proposeAdminSchema = nominatedAdminSchema.pick({
  userId: true,
  groupId: true,
})

export type ProposeAdminInterface = z.infer<typeof proposeAdminSchema>;

export const userSchema = proposeAdminSchema.pick({
  userId: true,
})

export type UserInterface = z.infer<typeof userSchema>;

export const groupSchema = nominateParamsSchema.pick({
  groupId: true,
})

export type GroupInterface = z.infer<typeof groupSchema>;

export const getNominatedMember = nominatedAdminSchema.pick({
  groupId: true
})

export type GetNominatedMemberInterface = z.infer<typeof getNominatedMember>;