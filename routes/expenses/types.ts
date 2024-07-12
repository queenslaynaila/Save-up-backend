import { z } from 'zod';

export const baseExpenseSchem = z.object({
  entity_id: z.number(),
  xid: z.number(),
  category_id: z.number(),
  description: z.string(),
  amount: z.number(),
  spent_at: z.string(),
  created_at: z.string()
});

export type BaseExpenseInterface = z.infer<typeof baseExpenseSchem>;


export const expenseCreationSchema = baseExpenseSchem.extend({
  entity_id: z.number().optional()
}).omit({
  xid: true,
  created_at: true
})

export type ExpenseCreationInterface = z.infer<typeof expenseCreationSchema>;

export const ExpenseUpdateValidationSchema = expenseCreationSchema.omit({
  entity_id: true
}).partial()

export const expenseQuerySchema = z.object({
  category_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});
  
export type ExpenseQueryInterface = z.infer<typeof expenseQuerySchema>;

export const expenseUpdateSchema = baseExpenseSchem.pick({
  category_id: true,
  description: true,
  amount: true,
  spent_at: true,
  entity_id: true
}).partial().extend({
  xid: z.number()
})

export type ExpenseUpdateInterface = z.infer<typeof expenseUpdateSchema>;

export const expenseBodySchema =expenseUpdateSchema.omit({
  xid: true
})

export type ExpenseBodyInterface = z.infer<typeof expenseBodySchema>;

export const expenseUpdateRes = baseExpenseSchem.pick({
  category_id: true,
  description: true,
  amount: true,
  spent_at: true
})

export type ExpenseUpdateRes = z.infer<typeof expenseUpdateRes>;