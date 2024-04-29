import { z } from 'zod';

export const baseExpenseSchema = z.object({
  entityId: z.number(),
  categoryId: z.number(),
  description: z.string(),
  amountSpent: z.number(),
  dateSpent: z.string(),
});
  
export const deleteExpenseSchema = baseExpenseSchema.pick({entityId: true})
  
export type DeleteExpenseInterface = z.infer<typeof deleteExpenseSchema>;
  
export const createExpenseSchemaValidation = baseExpenseSchema.partial()
  
export type CreateExpenseInterface = z.infer<typeof baseExpenseSchema>;
  
export const expenseSchema = baseExpenseSchema.extend({
  id: z.number(),
  createdAt: z.date()
})
  
export type ExpenseInterface = z.infer<typeof expenseSchema>;
  
export const updateExpenseSchema = baseExpenseSchema.partial().extend({id: z.number()});
  
export type UpdateExpenseInterface = z.infer<typeof updateExpenseSchema>;
  
export const validateUpdateExpenseSchema = updateExpenseSchema.omit({
  entityId:true,
  id:true
})
  
export const expenseIdSchema = z.object({
  expenseId: z.string(),
});
  
export type ExpenseIdInterface = z.infer<typeof expenseIdSchema>;
  
export const expenseByIdSchema = z.object({
  id: z.number(),
  entityId: z.number(),
});
  
export type ExpenseByIdInterface = z.infer<typeof expenseByIdSchema>;
  
export const expenseIdentifierSchema = z.object({
  expenseIdentifier: z.string(),
});
  
export type ExpenseIdentifierInterface = z.infer<typeof expenseIdentifierSchema>;
  
export const expenseQuerySchema = z.object({
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
  
export type ExpenseQueryInterface = z.infer<typeof expenseQuerySchema>;