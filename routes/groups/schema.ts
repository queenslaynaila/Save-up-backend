/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

const ENUM_EXIT_REASON = z.enum(['Self removal', 'Admin removal']);

export const groupsSchema = z.object({
  id: z.number(),
  name: z.string(),
  creator_id: z.number(),
  created_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable()
});

const PrevGroupNamesSchema = z.object({
  group_id: z.number().min(1),
  xid: z.number().min(1),
  name: z.string(),
  created_at: z.string().datetime()
});

const GroupMembersSchema = z.object({
  group_id: z.number().min(1),
  user_id: z.number().min(1),
  is_active: z.boolean()
});

const GroupJoinsSchema = z.object({
  group_id: z.number().min(1),
  user_id: z.number().min(1),
  xid: z.number().min(1),
  created_at: z.string().datetime()
});

const GroupLeftsSchema = z.object({
  group_id: z.number().int(),
  user_id: z.number().int(),
  xid: z.number().int(),
  reason: ENUM_EXIT_REASON,
  created_at: z.string().datetime()
});
