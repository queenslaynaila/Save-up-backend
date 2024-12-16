import { z } from 'zod';

export const ExpenseSchema = z.object({
  entity_id: z.number().min(1),
  xid: z.number().min(1),
  category_id: z.number().min(1),
  description: z.string(),
  amount: z.number().min(10),
  spent_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  created_at: z.string().datetime()
});

export type Expense = z.infer<typeof ExpenseSchema>;

export const expenseCreationSchema = ExpenseSchema.extend({
  entity_id: z.number().min(1).optional()
}).omit({
  xid: true,
  created_at: true
});

export type ExpenseCreationInterface = z.infer<typeof expenseCreationSchema>;

const expenseUpdateSchema = ExpenseSchema.pick({
  category_id: true,
  description: true,
  amount: true,
  spent_at: true,
  entity_id: true
}).partial().extend({
  xid: z.number().min(1)
});

export type ExpenseUpdateInterface = z.infer<typeof expenseUpdateSchema>;

export const expenseBodySchema = expenseUpdateSchema.omit({
  xid: true
});

const expenseUpdateRes = ExpenseSchema.pick({
  category_id: true,
  description: true,
  amount: true,
  spent_at: true
});

export type ExpenseUpdateRes = z.infer<typeof expenseUpdateRes>;