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

export const candidateParamSchema = z.object({
  group_id: z.number(),
  election_id: z.number()
})

export type CandidateParam = z.infer<typeof candidateParamSchema>

export const candidateResSchema = candidateSchema.pick({
  candidate_id: true
}).extend({
  full_name: z.string(),
});

export type CandidateRes = z.infer<typeof candidateResSchema>;