import { z } from 'zod';

export const userCumulaSchema = z.object({
  user_id:z.number()
})

export type UserCumulaInterface = z.infer< typeof userCumulaSchema>

export const topExpenseCategoriesSchema = z.array(
  z.object({
    category_id:z.number(),
    total_expense:z.number()
  })
)
  
export type TopExpenseCategoriesInterface = z.infer<typeof topExpenseCategoriesSchema>;
  
export const totalExpensesQuerySchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  category_id: z.string()
}).partial();

export type TotalExpenseQueryInterface = z.infer<typeof totalExpensesQuerySchema>;
  
export const totalExpenseResultSchema = z.object({
  total_expenses: z.number()
})

export type TotalExpenseInterface = z.infer<typeof totalExpenseResultSchema>;
  
export const totalDepositsResultSchema = z.object({
  total_deposits: z.number()
})

export type TotalDepositsInterface = z.infer<typeof totalDepositsResultSchema>
  
export const totalTargetsSchema = z.object({
  total_target_amount: z.number()
})

export type TotalTargetsInterface = z.infer<typeof totalTargetsSchema>;
  
export const totalTargetPocketsQuerySchema = z.object({
  priority: z.string(),
  status: z.string(),
  category_id: z.string()
}).partial();

export const totalSavingsResultSchema = z.object({
  total_deposits: z.number()
})

export type TotalTargetPocketsQueryInterface = z.infer<typeof totalTargetPocketsQuerySchema>;