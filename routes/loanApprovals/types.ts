import { z } from 'zod';
import { ApprovalStatusEnum } from '../loans/types';

export const adminLoanApprovalSchema = z.object({
  request_id: z.number().int(),
  admin_id: z.number().int(),
  group_id: z.number().int(),
  status: ApprovalStatusEnum,
  reason: z.string()
});

export type AdminLoanApproval = z.infer<typeof adminLoanApprovalSchema>;

export const loanApprovalSchema = adminLoanApprovalSchema.omit({
  admin_id: true
});

export type LoanApproval = z.infer<typeof loanApprovalSchema>;

export const finalApprovalSchema = adminLoanApprovalSchema.omit({
  status: true,
  reason: true
});

export type FinalnApproval = z.infer<typeof finalApprovalSchema>;

export const finalApprovalBody = finalApprovalSchema.omit({
  admin_id: true
})

export type FinalApprovalBody = z.infer<typeof finalApprovalBody>;