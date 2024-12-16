import { z } from 'zod';

const ENUM_POCKET_TYPE = z.enum(['Standard', 'Locked']);
const ENUM_PRIORITY = z.enum(['Low', 'Intermediate', 'High']);
const ENUM_STATUS = z.enum(['In Progress', 'Completed']);

export const pocketSchema = z.object({
  entity_id: z.number().min(1),
  xid: z.number().min(1),
  category_id: z.number().min(1),
  name: z.string().nullable(),
  pocket_type: ENUM_POCKET_TYPE,
  priority: ENUM_PRIORITY,
  status: ENUM_STATUS,
  target_amount: z.number(),
  target_at: z.string(),
  completed_at: z.string(),
  created_at: z.string(),
  deleted_at: z.string().optional()
});

const ENUM_TRANSACTION_TYPE = z.enum([
  'Saving',
  'ExternalSaving',
  'Interest',
  'Withdrawal',
  'Penalty',
  'TransferIn',
  'TransferOut',
  'Loan',
  'Repayment'
]);

export const transactionTypeSchema = z.object({
  id: z.number(),
  slug: ENUM_TRANSACTION_TYPE,
  created_at: z.string().datetime()
});

export const transactionSchema = z.object({
  entity_id: z.number().min(1),
  xid: z.number().min(1),
  type_id: z.number(),
  pocket_id: z.number().min(1),
  reference_id: z.number(),
  delta: z.number(),
  balance: z.number(),
  created_at: z.string().datetime()
});