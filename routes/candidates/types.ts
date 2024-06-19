import { z } from 'zod';

export const candidateSchema = z.object({
  group_id: z.number(),
  election_id: z.number(),
  candidate_id: z.number(),
  chosen_by: z.number()
});

export type CandidateInterface = z.infer<typeof candidateSchema>;

export const candidateRequestBody = candidateSchema.omit({
  chosen_by: true
});
  
export type CandidateRequestBody = z.infer<typeof candidateRequestBody>;