import { z } from 'zod';

export enum ElectionType {
  BALLOT = 'Ballot',
  RATIFICATION = 'Ratification'
}

const election = z.object({
  group_id: z.number().min(1),
  initiator_id: z.number(),
  type: z.enum([ElectionType.BALLOT, ElectionType.RATIFICATION])
});

export type ElectionInterface = z.infer<typeof election>

export const electionValidation = election.omit({
  initiator_id: true
});

export const electionBodySchema = election.pick({
  group_id: true
});

const electionRequestSchema = election.pick({
  group_id: true
}).extend({
  user_id: z.number()
});

export type ElectionRequest = z.infer<typeof electionRequestSchema>;

export const electionRetrievalSchema = election.extend({
  election_id: z.number().min(1),
  initiator_name: z.string(),
  created_at: z.string().datetime()
});

export type ElectionRetrieval = z.infer<typeof electionRetrievalSchema>;

const candidateSchema = z.object({
  group_id: z.number().min(1),
  election_id: z.number().min(1),
  candidate_id: z.number(),
  user_id: z.number()
});

export type CandidateInterface = z.infer<typeof candidateSchema>;

export const candidateRequestBody = candidateSchema.omit({
  user_id: true
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