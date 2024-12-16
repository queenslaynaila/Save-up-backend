import { z } from 'zod';

const approveWithdrawalSchema = z.object({
  group_id: z.number(),
  admin_id: z.number(),
  withdrawal_id: z.number(),
  status: z.enum(['Reject', 'Approved', 'Pending']),
  reason: z.string()
});

export type ApproveWithdrawal = z.infer<typeof approveWithdrawalSchema>;

export const approveValidation = approveWithdrawalSchema.omit({
  admin_id: true
});