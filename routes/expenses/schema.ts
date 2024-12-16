import { z } from 'zod';

export const expenseSchema = z.object({
  entity_id: z.number().min(1),
  xid: z.number().min(1),
  category_id: z.number().min(1),
  description: z.string(),
  amount: z.number().min(10),
  spent_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  created_at: z.string().datetime()
});

export type Expense = z.infer<typeof expenseSchema>;