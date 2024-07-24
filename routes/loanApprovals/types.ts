import { z } from 'zod';

export const adminLoanApprovalSchema = z.object({
  request_id: z.number().int(),
  admin_id: z.number().int(),
  group_id: z.number().int(),
  status: z.boolean(),
  reason: z.string()
});

export type AdminLoanApproval = z.infer<typeof adminLoanApprovalSchema>;

export const loanApprovalSchema = adminLoanApprovalSchema.omit({
  admin_id: true
});

export type LoanApproval = z.infer<typeof loanApprovalSchema>;

