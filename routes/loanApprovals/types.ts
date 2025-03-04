import { z } from 'zod';
import { ApprovalStatusEnum } from '../loans/types';

const adminLoanApprovalSchema = z.object({
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

const finalApprovalSchema = adminLoanApprovalSchema.omit({
  status: true,
  reason: true
});

export type FinalApproval = z.infer<typeof finalApprovalSchema>;

export const finalApprovalBody = finalApprovalSchema.omit({
  admin_id: true
});
