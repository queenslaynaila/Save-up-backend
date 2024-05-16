import { z } from 'zod';

export const baseExpenseSchema = z.object({
  entity_id: z.number(),
  category_id: z.number(),
  expense_name: z.string(),
  description: z.string(),
  amount_spent: z.number(),
  date_spent: z.string(),
});
  
export const deleteExpenseSchema = baseExpenseSchema.pick({entity_id: true})
  
export type DeleteExpenseInterface = z.infer<typeof deleteExpenseSchema>;
  
export const createExpenseSchemaValidation = baseExpenseSchema.partial()
  
export type CreateExpenseInterface = z.infer<typeof baseExpenseSchema>;
  
export const expenseSchema = baseExpenseSchema.extend({
  id: z.number(),
  created_at: z.date()
})
  
export type ExpenseInterface = z.infer<typeof expenseSchema>;
  
export const updateExpenseSchema = baseExpenseSchema.partial().extend({id: z.number()});
  
export type UpdateExpenseInterface = z.infer<typeof updateExpenseSchema>;
  
export const validateUpdateExpenseSchema = updateExpenseSchema.omit({
  entity_id:true,
  id:true
})
  
export const expenseIdSchema = z.object({
  expenseId: z.string(),
});
  
export type ExpenseIdInterface = z.infer<typeof expenseIdSchema>;
  
export const expenseByIdSchema = z.object({
  id: z.number(),
  entity_id: z.number(),
});
  
export type ExpenseByIdInterface = z.infer<typeof expenseByIdSchema>;
  
export const expenseIdentifierSchema = z.object({
  expenseIdentifier: z.string(),
});
  
export type ExpenseIdentifierInterface = z.infer<typeof expenseIdentifierSchema>;
  
export const expenseQuerySchema = z.object({
  category_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});
  
export type ExpenseQueryInterface = z.infer<typeof expenseQuerySchema>;