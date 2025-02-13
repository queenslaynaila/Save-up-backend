import { z } from 'zod';

const approveWithdrawalSchema = z.object({
  group_id: z.number().min(1),
  admin_id: z.number(),
  request_id: z.number(),
  status: z.enum(['Rejected', 'Approved', 'Pending']),
  reason: z.string()
});

export type ApproveWithdrawal = z.infer<typeof approveWithdrawalSchema>;

export const approveValidation = approveWithdrawalSchema.omit({
  admin_id: true
});