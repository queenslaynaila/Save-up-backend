import { z } from 'zod';

export const ExpenseSchema = z.object({
  entity_id: z.number(),
  xid: z.number(),
  category_id: z.number(),
  description: z.string(),
  amount: z.number(),
  spent_at: z.string().date().optional(),
  created_at: z.string()
});

export type Expense = z.infer<typeof ExpenseSchema>;

export const expenseCreationSchema = ExpenseSchema.extend({
  entity_id: z.number().optional()
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
  xid: z.number()
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