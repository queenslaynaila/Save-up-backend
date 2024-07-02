import { z } from 'zod'

export enum ElectionType {
  BALLOT = 'Ballot',
  RATIFICATION = 'Ratification'
}

export const election = z.object({
  group_id:z.number(),
  initiator_id:z.number(),
  type: z.enum([ElectionType.BALLOT, ElectionType.RATIFICATION])
})

export type ElectionInterface = z.infer<typeof election>

export const electionValidation = election.omit({
  initiator_id:true
})

export type ElectionValidation = z.infer<typeof electionValidation>

export const electionBodySchema = election.pick({
  group_id: true
});

export type ElectionBody = z.infer<typeof electionBodySchema>;

export const electionRequestSchema = election.pick({
  group_id: true
}).extend({
  user_id: z.number()
});

export type ElectionRequest = z.infer<typeof electionRequestSchema>;

export const electionRetrievalSchema = election.extend({
  election_id: z.number(),
  initiator_name: z.string(),
  created_at: z.string()
});

export type ElectionRetrieval = z.infer<typeof electionRetrievalSchema>;
