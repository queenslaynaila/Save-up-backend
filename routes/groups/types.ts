import { z } from 'zod';

const approveWithdrawalSchema = z.object({
  group_id: z.number(),
  admin_id: z.number(),
  election_id: z.number(),
  withdrawal_id: z.number(),
  status: z.enum(['REJECT', 'ACCEPT', 'PENDING']),
  reason: z.string()
});

export type ApproveWithdrawal = z.infer<typeof approveWithdrawalSchema>;

export const withdrawal = approveWithdrawalSchema.omit({
  admin_id: true,
  group_id: true
});