import { z } from 'zod';

const ratificationSchema = z.object({
  group_id: z.number().min(1),
  election_id: z.number().min(1),
  user_id: z.number().min(1),
  is_ratified: z.boolean()
});

export type RatificationInterface = z.infer<typeof ratificationSchema>

const computeRatification = ratificationSchema.pick({
  group_id: true,
  election_id: true,
  user_id: true
});

export type ComputeRatificationInterface = z.infer<typeof computeRatification>

export const ratificationResults = z.object({
  full_name: z.string(),
  ratification_status: z.boolean()
});

export type RatificationResultsInterface = z.infer<typeof ratificationResults>

export const ratificationValidation = ratificationSchema.omit({
  user_id: true,
  is_ratified: true
});


export const computeStatus = ratificationSchema.omit({
  user_id: true
});
