import { z } from 'zod';

enum ElectionType {
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