import { z } from 'zod';
import { transactionByUser } from '../usertransactions/types';

export const basePocketSchema = z.object({
  entity_id: z.number().optional(),
  xid: z.number(),
  category_id: z.number(),
  name: z.string(),
  priority: z.enum(['High', 'Intermediate', 'Low']),
  status: z.enum(['In Progress', 'Completed']),
  pocket_type: z.enum(['Standard', 'Locked']),
  target_amount: z.number(),
  target_at: z.string(),
  created_at: z.string(),
  completed_at: z.string(),
});

export type BasePocketType = z.infer<typeof basePocketSchema>;

export const pocketCreateSchema = basePocketSchema.pick({
  category_id: true,
  name: true,
  priority: true,
  pocket_type: true,
  target_amount: true,
  target_at: true,
}).required()
  .extend({
    entity_id: z.number().optional()
  });

export type PocketCreateType = z.infer<typeof pocketCreateSchema>;

export const PocketByEntityIdSchema =  basePocketSchema.pick({
  entity_id: true
});

export type PocketByEntityType = z.infer<typeof PocketByEntityIdSchema>;

export const pocketPostRequestSchema = pocketCreateSchema.omit({
  entity_id: true
}).extend({
  entity_id: z.number().optional()
});

export const PocketQueryParamsSchema = basePocketSchema.pick({
  priority: true,
  status: true
}).extend({
  category_id: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  is_default: z.string(),
  xid: z.string()
}).partial();

export type PocketQueryParamsType = z.infer<typeof PocketQueryParamsSchema>;

export const PocketUpdateSchema = basePocketSchema.pick({
  name: true,
  category_id: true,
  priority: true,
  target_amount: true,
  target_at: true,
  pocket_type: true
}).partial().extend({
  entity_id: z.number().optional(),
  xid: z.number(),
});

export type PocketUpdateType = z.infer<typeof PocketUpdateSchema>;

export const pocketPatchRequestSchema = PocketUpdateSchema.omit({
  xid: true
}).extend({
  entity_id: z.number().optional()
});

export type PocketPatchType = z.infer<typeof pocketPatchRequestSchema>;

export const transactionBody = z.object({
  pocket_id:z.string()
})

export type TransactionBody = z.infer<typeof transactionBody>;