import { z } from 'zod';

export const groupsSchema = z.object({
  id: z.number().min(1),
  name: z.string(),
  creator_id: z.number().min(1),
  created_at: z.string().datetime(),
  deleted_at: z.string().date().optional()
});
export type Group = z.infer<typeof groupsSchema>;

export const ElectionType = z.enum(["Ballot", "Ratification", "Default"]);
export const ElectionStatus = z.enum(["Open", "Closed", "Cancelled"]);

export const electionSchema= z.object({
  group_id: z.number().int(),
  xid: z.number().int(),
  initiator_id: z.number().int(),
  type: ElectionType,
  status: ElectionStatus.default("Open"),
  created_at: z.string().datetime(),
  closed_at: z.string().datetime().nullable(),
  nomination_ends_at: z.string().datetime()
});
export type Election = z.infer<typeof electionSchema>;

export const ratificationSchema = z.object({
  group_id: z.number().int(),
  election_id: z.number().int(),
  user_id: z.number().int(),
  is_ratified: z.boolean(),
  created_at: z.string().datetime()
});
export type Ratification = z.infer<typeof ratificationSchema>;

export const candidateSchema = z.object({
  group_id: z.number().int(),
  election_id: z.number().int(),
  candidate_id: z.number().int(),
  chosen_by: z.number().int(),
  created_at: z.string().datetime()
});
export type Candidate = z.infer<typeof candidateSchema>;

export const ballotSchema = z.object({
  group_id: z.number().int(),
  election_id: z.number().int(),
  candidate_id: z.number().int(),
  user_id: z.number().int(),
  created_at: z.string().datetime()
});
export type Ballot = z.infer<typeof ballotSchema>;