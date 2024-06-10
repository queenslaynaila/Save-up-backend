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

export const expenseUpdateRes = baseExpenseSchem.pick({
  category_id: true,
  description: true,
  amount: true,
  spent_at: true
})

export type ExpenseUpdateRes = z.infer<typeof expenseUpdateRes>;





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



export const updateExpenseSchema = baseExpenseSchema.partial().extend({
  xid: z.number()
});
  
export type UpdateExpenseInterface = z.infer<typeof updateExpenseSchema>;

export const validateUpdateExpenseSchema = updateExpenseSchema.omit({
  xid:true
})