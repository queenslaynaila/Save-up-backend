import { z } from 'zod';

export const ElectionType = z.enum(['Ballot', 'Ratification', 'Default']);
export const ElectionStatus = z.enum(['Open', 'Closed', 'Cancelled']);

export const candidateSchema = z.object({
  group_id: z.number().int().min(1),
  election_id: z.number().int().min(1),
  candidate_id: z.number().int().min(1),
  chosen_by: z.number().int().min(1),
  created_at: z.string()
});