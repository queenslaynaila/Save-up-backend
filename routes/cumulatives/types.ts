import { z } from 'zod';

export const getUserCumulaSchema = z.object({
  userId:z.number()
})

export type GetUserCumulaInterface = z.infer< typeof getUserCumulaSchema>

export const getTopExpenseCategoriesSchema = z.array(
  z.object({
    categoryId:z.number(),
    totalExpense:z.number()
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
  totalExpenses: z.number()
})

export type GetTotalExpenseInterface = z.infer<typeof getTotalExpenseResultSchema>;
  
export const getTotalDepositsResultSchema = z.object({
  totalDeposits: z.number()
})

export type GetTotalDepositsInterface = z.infer<typeof getTotalDepositsResultSchema>
  
export const getTotalTargetsSchema = z.object({
  totalTargetAmount: z.number()
})

export type GetTotalTargetsInterface = z.infer<typeof getTotalTargetsSchema>;
  
export const totalTargetPocketsQuerySchema = z.object({
  priority: z.string().optional(),
  status: z.string().optional(),
  categoryId: z.string().optional()
});

export const getTotalSavingsResultSchema = z.object({
  totalDeposits: z.number()
})

export type TotalTargetPocketsQueryInterface = z.infer<typeof totalTargetPocketsQuerySchema>;
  