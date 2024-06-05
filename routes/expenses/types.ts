import { z } from 'zod';

export const baseExpenseSchema = z.object({
  entity_id: z.number(),
  category_id: z.number(),
  description: z.string(),
  amount: z.number(),
  spent_at: z.string()
});

export const createExpenseSchema = baseExpenseSchema.extend({
  entity_id: z.number().optional()
})

export type CreateExpenseInterface = z.infer<typeof createExpenseSchema>;

export const expenseSchema = baseExpenseSchema.extend({
  xid: z.number(),
  created_at: z.date()
})
  
export type ExpenseInterface = z.infer<typeof expenseSchema>;

export const expenseQuerySchema = z.object({
  category_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});
  
export type ExpenseQueryInterface = z.infer<typeof expenseQuerySchema>;

export const updateExpenseSchema = baseExpenseSchema.partial().extend({
  xid: z.number()
});
  
export type UpdateExpenseInterface = z.infer<typeof updateExpenseSchema>;

export const validateUpdateExpenseSchema = updateExpenseSchema.omit({
  xid:true
})