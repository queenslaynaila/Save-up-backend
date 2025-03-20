import { z } from 'zod';

export const expenseSchema = z.object({
  entity_id: z.number().int(),
  xid: z.number().int(),
  category_id: z.number().int(),
  description: z.string(),
  amount: z.number().min(10),
  spent_at: z.string()
            .regex(/^(20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
            .optional(),
  created_at: z.string().datetime()
});

export type Expense = z.infer<typeof expenseSchema>;