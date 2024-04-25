import { z } from 'zod';

export const getUserCumulaSchema = z.object({
  userId:z.number()
})

export type GetUserCumulaInterface = z.infer< typeof getUserCumulaSchema>

export const getTopExpenseCategoriesSchema = z.array(
  z.object({
    category_id:z.number(),
    total_expense:z.number()
  })
)
  
export type TopExpenseCategoriesInterface = z.infer<typeof getTopExpenseCategoriesSchema>;
  
export const getTotalExpensesQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional()
});

export type GetTotalExpenseQueryInterface = z.infer<typeof getTotalExpensesQuerySchema>;
  
export const getTotalExpenseResultSchema = z.object({
  total_expenses: z.number()
})

export type GetTotalExpenseInterface = z.infer<typeof getTotalExpenseResultSchema>;
  
export const getTotalDepositsResultSchema = z.object({
  total_deposits: z.number()
})

export type GetTotalDepositsInterface = z.infer<typeof getTotalDepositsResultSchema>
  
export const getTotalTargetsSchema = z.object({
  total_target_amount: z.number()
})

export type GetTotalTargetsInterface = z.infer<typeof getTotalTargetsSchema>;
  
export const totalTargetGoalsQuerySchema = z.object({
  priority: z.string().optional(),
  status: z.string().optional(),
  category_id: z.string().optional()
});

export type TotalTargetGoalsQueryInterface = z.infer<typeof totalTargetGoalsQuerySchema>;
  