import { z } from "zod";

export const ElectionType = z.enum(["Ballot", "Ratification", "Default"]);
export const ElectionStatus = z.enum(["Open", "Closed", "Cancelled"]);

export const ElectionSchema = z.object({
  group_id: z.number().int(),
  xid: z.number().int(),
  initiator_id: z.number().int(),
  type: ElectionType,
  status: ElectionStatus.default("Open"),
  created_at: z.string().datetime(),
  closed_at: z.string().datetime().nullable(),
  nomination_ends_at: z.string().datetime()
});

export type Election = z.infer<typeof ElectionSchema>;