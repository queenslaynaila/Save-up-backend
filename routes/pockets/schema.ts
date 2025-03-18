import { z } from 'zod';

const ENUM_POCKET_TYPE = z.enum(['Standard', 'Locked']);
const ENUM_PRIORITY = z.enum(['Low', 'Intermediate', 'High']);
const ENUM_STATUS = z.enum(['In Progress', 'Completed']);

export const pocketSchema = z.object({
  entity_id: z.number().min(1),
  xid: z.number().min(1),
  category_id: z.number().min(1),
  name: z.string(),
  pocket_type: ENUM_POCKET_TYPE,
  priority: ENUM_PRIORITY,
  status: ENUM_STATUS,
  target_amount: z.number().min(100),
  target_at: z.string().date(),
  completed_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  deleted_at: z.string().datetime().optional()
});

export type Pocket = z.infer<typeof pocketSchema>;