import { z } from 'zod';

const ballotSchema = z.object({
  group_id: z.number().min(1),
  election_id: z.number().min(1),
  candidate_id: z.number(),
  user_id: z.number()
});

export type BallotInterface = z.infer<typeof ballotSchema>

export const ballotBodySchema = ballotSchema.omit({
  user_id: true
});

const computeBallot = ballotBodySchema.omit({
  candidate_id: true
}).extend({
  user_id: z.number()
});

export type BallotComputeInterface = z.infer<typeof computeBallot>

const ballotParamsSchema = ballotBodySchema.pick({
  group_id: true
});

type BallotParamsInterface = z.infer<typeof ballotParamsSchema>

export const ballotBodyRequest = ballotBodySchema.pick({
  election_id: true,
  group_id: true
});

type BallotBodyRequestInterface = z.infer<typeof ballotBodyRequest>

export const ballotResultSchema = z.object({
  full_name: z.string()
});

export type BallotResultInterface = z.infer<typeof ballotResultSchema>