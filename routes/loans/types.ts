import { z } from 'zod';

export const baseRequestLoanSchema = z.object({
  group_id: z.number().int().positive(),
  pocket_id: z.number().int().positive(),
  borrower_id: z.number().int().positive(), // Added borrower_id here for completeness
  guarantor_id: z.number().int().positive(),
  amount: z.number().positive(),
  reason: z.string(),
  period: z.string()
});

export type BaseRequestLoan = z.infer<typeof baseRequestLoanSchema>;

export const requestLoanSchema = baseRequestLoanSchema.omit({
  borrower_id: true
});

export type RequestLoan = z.infer<typeof requestLoanSchema>;

export const reviewedLoansParams = baseRequestLoanSchema.pick({
  group_id: true
}).extend({
  user_id: z.number().int(),
  approval_status: z.literal('Pending')
});
export type ReviewedLoansParams = z.infer<typeof reviewedLoansParams>;

export const ApprovalStatusEnum = z.enum([
  'Pending', 'Completed', 'Denied'
]);

export const reviewedLoanSchema = z.object({
  request_id: z.number().int().positive(),
  group_id: z.number().int().positive(),
  group_name: z.string(),
  pocket_id: z.number().int().positive(),
  amount: z.number().positive(),
  approval_status:ApprovalStatusEnum
});

export type ReviewedLoan = z.infer<typeof reviewedLoanSchema>;