import { z } from 'zod';

const Recipient = z.object({
  recipient_id: z.number(),
  amount: z.number()
});
 
export const withdrawalRequest = z.object({
  group_id:z.number(),
  pocket_id:z.number(),
  initiator_id:z.number(),
  amount:z.number(),
  reason:z.string(),
  recipients:z.array(Recipient)
})
  
export type WithdrawalRequest = z.infer<typeof withdrawalRequest>;

export const withdrawalValidation = withdrawalRequest.omit({
  initiator_id: true
})

export type WithdrawalValidation = z.infer<typeof withdrawalValidation>;
  
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
  amount: true,
  recipients: true
}).extend({
  election_id: z.number()
})
  
export type InitiateGroupWithdrawal = z.infer<typeof initiateGroupWithdrawalSchema>;