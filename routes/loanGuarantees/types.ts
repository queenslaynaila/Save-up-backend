import { z } from 'zod';

export const baseGuaranteeSchema = z.object({
  group_id: z.number().int().positive(),
  request_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  approval: z.boolean()
});

export type BaseGuarantee = z.infer<typeof baseGuaranteeSchema>;

export const guaranteeLoanBodySchema = baseGuaranteeSchema.omit({
  user_id: true
});

export type GuaranteeLoanBody = z.infer<typeof guaranteeLoanBodySchema>;

export const loanRequestSchema = baseGuaranteeSchema.pick({
  group_id: true
}).extend({
  request_id: z.number().int(),
  group_name: z.string(),
  borrower_id: z.number().int(),
  borrower_name: z.string().min(1),
  amount: z.number().positive(),
  purpose: z.string(),
  repayment_period: z.string() // Assuming INTERVAL is represented as a string in the request
});

export type LoanRequest = z.infer<typeof loanRequestSchema>;