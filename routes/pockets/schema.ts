import { z } from 'zod';
export const ENUM_POCKET_TYPE = z.enum(['Standard', 'Locked']);
const ENUM_PRIORITY = z.enum(['Low', 'Intermediate', 'High']);
const ENUM_STATUS = z.enum(['In Progress', 'Completed']);

export type PocketType = z.infer<typeof ENUM_POCKET_TYPE>;

export const pocketSchema = z.object({
  entity_id: z.number().int().min(1),
  xid: z.number().int().min(1),
  category_id: z.number().int().min(1),
  name: z.string(),
  pocket_type: ENUM_POCKET_TYPE,
  priority: ENUM_PRIORITY,
  status: ENUM_STATUS,
  currency: z.string(),
  target_amount: z.number(),
  target_at: z.string(),
  completed_at: z.string().optional(),
  created_at: z.string(),
  deleted_at: z.string().optional()
});

export type Pocket = z.infer<typeof pocketSchema>;