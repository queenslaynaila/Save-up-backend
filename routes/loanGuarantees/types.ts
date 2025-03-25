import { z } from 'zod';

const baseGuaranteeSchema = z.object({
  group_id: z.number().int().min(1),
  request_id: z.number().int().min(1),
  user_id: z.number().int().min(1),
  approval: z.boolean()
});

export type BaseGuarantee = z.infer<typeof baseGuaranteeSchema>;

export const guaranteeLoanBodySchema = baseGuaranteeSchema.omit({
  user_id: true
});


export const loanRequestSchema = baseGuaranteeSchema.pick({
  group_id: true
}).extend({
  request_id: z.number().int().min(1),
  group_name: z.string(),
  borrower_id: z.number().int().min(1),
  borrower_name: z.string().min(1),
  amount: z.number(),
  purpose: z.string(),
  repayment_period: z.string() // Assuming INTERVAL is represented as a string in the request
});

export type LoanRequest = z.infer<typeof loanRequestSchema>;