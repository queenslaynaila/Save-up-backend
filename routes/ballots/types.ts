import { z } from 'zod';

export const ballotSchema = z.object({
  group_id: z.number(),
  election_id: z.number(),
  candidate_id: z.number(),
  user_id: z.number()
});

export type BallotInterface = z.infer<typeof ballotSchema>

export const ballotBodySchema = ballotSchema.omit({
  user_id:true
})

export type BallotBodyInterface = z.infer<typeof ballotBodySchema>

