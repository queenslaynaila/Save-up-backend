import { z } from 'zod';

const candidateSchema = z.object({
  group_id: z.number().min(1),
  election_id: z.number().min(1),
  candidate_id: z.number(),
  chosen_by: z.number()
});

export type CandidateInterface = z.infer<typeof candidateSchema>;

export const candidateRequestBody = candidateSchema.omit({
  chosen_by: true
});

export const candidateParamSchema = z.object({
  group_id: z.number().min(1),
  election_id: z.number()
});

const candidateReqSchema = candidateParamSchema.extend({
  user_id: z.number()
});

export type CandidateReq = z.infer<typeof candidateReqSchema>;

export const candidateResSchema = candidateSchema.pick({
  candidate_id: true
}).extend({
  full_name: z.string()
});

export type CandidateRes = z.infer<typeof candidateResSchema>;