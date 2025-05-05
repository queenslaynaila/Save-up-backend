import { z } from 'zod';

export const ElectionType = z.enum(['Ballot', 'Ratification', 'Default']);
export const ElectionStatus = z.enum(['Open', 'Closed', 'Cancelled']);

export const ratificationSchema = z.object({
  group_id: z.number().int().min(1),
  election_id: z.number().int().min(1),
  user_id: z.number().int().min(1),
  is_ratified: z.boolean(),
  created_at: z.string().datetime()
});
export type Ratification = z.infer<typeof ratificationSchema>;

export const candidateSchema = z.object({
  group_id: z.number().int().min(1),
  election_id: z.number().int().min(1),
  candidate_id: z.number().int().min(1),
  chosen_by: z.number().int().min(1),
  created_at: z.string().datetime()
});

export const ballotSchema = z.object({
  group_id: z.number().int().min(1),
  election_id: z.number().int().min(1),
  candidate_id: z.number().int().min(1),
  user_id: z.number().int().min(1),
  created_at: z.string().datetime()
});
export type Ballot = z.infer<typeof ballotSchema>;