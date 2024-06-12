import { z } from 'zod';

export const adminProposalSchema = z.object({
  group_id: z.number(),
  receiver_id: z.number(),
})

export type AdminProposalInterface = z.infer<typeof adminProposalSchema>;

export const groupByIdSchema = adminProposalSchema.pick({
  group_id: true,
})

export type GroupByIdInterface = z.infer<typeof groupByIdSchema>;

export const adminApprovalSchema = adminProposalSchema.pick({
  group_id: true
}).extend({
  voter_id: z.number(),
  nominee_id: z.number(),
  election_id:z.number(),
  vote: z.boolean()
})

export type AdminApprovalInterface = z.infer<typeof adminApprovalSchema>;

export const nominateParamsSchema = z.object({
  group_id: z.string(),
  nominee_id: z.string(),
});
  
export type NominateParamsInterface = z.infer<typeof nominateParamsSchema>;

export const groupSchema = nominateParamsSchema.pick({
  group_id: true,
})

export type GroupInterface = z.infer<typeof groupSchema>;