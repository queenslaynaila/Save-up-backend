import { z } from 'zod';
export const baseGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_by: z.string(),
  created_at:z.string()
});

export type BaseGroupInterface = z.infer<typeof baseGroupSchema>;

export const groupsByUserSchema = z.object({
  user_id:z.number()
})

export type GroupsByUserInterface = z.infer<typeof groupsByUserSchema>;

export const groupCreationSchema = baseGroupSchema.pick({
  name: true
}).extend({
  created_by:z.number()
})

export type GroupCreationInterface = z.infer<typeof groupCreationSchema>;

export const groupCreationValidation = groupCreationSchema.omit({created_by:true})

export const sharedGRoupSchema = z.object({
  logged_in_user_id: z.number(), 
  user_id: z.number() 
})

export type SharedGroupInterface = z.infer<typeof sharedGRoupSchema>;

export const groupMemberSchema = z.object({
  user_id: z.number(),
  full_name: z.string()
})

export type GroupMemberInterface = z.infer<typeof groupMemberSchema>;

export const groupUpdateSchema = baseGroupSchema.pick({
  id: true,
  name: true
}).extend({
  user_id:z.number()
})

export type GroupUpdateInterface = z.infer<typeof groupUpdateSchema>;

export const validateGroupUpdateSchema = groupUpdateSchema.omit({
  id:true,
  user_id:true
})

export enum ExitReason {
  SELFREMOVAL = 'Self removal',
  ADMINREMOVAL = 'Admin removal',
  RULEVIOLATION = 'Rule violation',
  OTHER = 'Other'
}

export const groupExitSchema = baseGroupSchema.pick({
  id: true
}).extend({
  user_id:z.number()
})

export type GroupExitInterface = z.infer<typeof groupExitSchema>;

export const removeMember = z.object({
  user_id:z.number(), 
  admin_id:z.number(),
  id:z.number()
})

export type RemoveMemberInterface = z.infer<typeof removeMember>;

const Recipient = z.object({
  recipient_id: z.number(),
  amount: z.number()
});


export const withdrawalRequest = z.object({
  group_id:z.number(),
  pocket_id:z.number(),
  election_id:z.number(),
  initiator_id:z.number(),
  amount:z.number(),
  reason:z.string(),
  recipients:z.array(Recipient)
})

export type WithdrawalRequest = z.infer<typeof withdrawalRequest>;

export const approveWithdrawalSchema = z.object({
  group_id: z.number(),
  admin_id: z.number(),
  election_id: z.number(),
  withdrawal_id: z.number(),
  status: z.enum(['REJECT', 'ACCEPT', 'PENDING']),
  reason: z.string(),
});

export type ApproveWithdrawal = z.infer<typeof approveWithdrawalSchema>;

export const initiateGroupWithdrawalSchema = withdrawalRequest.pick({
  pocket_id: true,
  election_id: true,
  amount: true,
  recipients: true
})

export type InitiateGroupWithdrawal = z.infer<typeof initiateGroupWithdrawalSchema>;