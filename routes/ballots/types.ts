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

export const computeBallot = ballotBodySchema.omit({
  user_id:true,
  candidate_id:true
})

export type BallotComputeInterface = z.infer<typeof computeBallot>

export const ballotParamsSchema = ballotBodySchema.pick({
  group_id: true
})

export type BallotParamsInterface = z.infer<typeof ballotParamsSchema>

export const ballotBodyRequest = ballotBodySchema.pick({
  election_id: true
})

export type BallotBodyRequestInterface = z.infer<typeof ballotBodyRequest>