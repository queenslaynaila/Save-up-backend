import { z } from 'zod';

export const ratificationSchema = z.object({
  group_id:z.number(), 
  election_id:z.number(),
  user_id: z.number(),
  is_ratified: z.boolean()
})

export type RatificationInterface = z.infer<typeof ratificationSchema>

export const computeRatification = ratificationSchema.pick({
  group_id: true,
  election_id: true,
  user_id: true
})

export type ComputeRatificationInterface = z.infer<typeof computeRatification>

export const ratificationResults = z.object({
  full_name: z.string(),
  ratification_status: z.boolean()
})

export type RatificationResultsInterface = z.infer<typeof ratificationResults>

export const ratificationValidation = ratificationSchema.omit({
  user_id: true,
  is_ratified: true
})

export type RatificationValidationInterface = z.infer<typeof ratificationValidation>

export const computeStatus = ratificationSchema.omit({
  user_id: true
})

export type ComputeStatusInterface = z.infer<typeof computeStatus>