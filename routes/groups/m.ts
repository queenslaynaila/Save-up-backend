import { z } from 'zod';

const ExitReason = z.enum(['Self removal', 'Admin removal']);

export const groupsSchema = z.object({
  id: z.number(),
  name: z.string(),
  creator_id: z.number(),
  created_at: z.string().datetime(),
  deleted_at: z.string().date().optional()
});

export type Group = z.infer<typeof groupsSchema>;

const PrevGroupNamesSchema = z.object({
  group_id: z.number().min(1),
  xid: z.number().min(1),
  name: z.string(),
  created_at: z.string().datetime()
});

type PrevGroupNames = z.infer<typeof PrevGroupNamesSchema>;

const groupMembersSchema = z.object({
  group_id: z.number(),
  user_id: z.number(),
  is_active: z.boolean()
});

type GroupMembers = z.infer<typeof groupMembersSchema>;

const groupJoinSchema = z.object({
  group_id: z.number(),
  user_id: z.number(),
  xid: z.number(),
  created_at: z.string().datetime()
});

type GroupJoin = z.infer<typeof groupJoinSchema>;

const groupLeaveSchema = z.object({
  group_id: z.number(),
  user_id: z.number(),
  xid: z.number(),
  reason: ExitReason,
  created_at: z.string().datetime()
});

type GroupLeave = z.infer<typeof groupLeaveSchema>;