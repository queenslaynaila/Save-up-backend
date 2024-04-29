import { z } from 'zod';

export const enum transactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
  TRANSFER = 'Transfer',
}

export const getTransactionsInputSchema = z.object({
  pocket_id: z.number()
})

export type GetTransactionsInput = z.infer<typeof getTransactionsInputSchema>;

export const getTransactionRespSchema = z.object({
  transaction_id: z.number().positive(),
  transaction_type: z.enum([transactionType.DEPOSIT, transactionType.WITHDRAWAL, transactionType.TRANSFER]),
  amount: z.number(),
  transaction_date: z.string(),
  transfer_from: z.string() || null
})

export type GetTransactionResp = z.infer<typeof getTransactionRespSchema>;

export const getTransactionQuery = z.object({
  transaction_type: z.enum([transactionType.DEPOSIT, transactionType.WITHDRAWAL, transactionType.TRANSFER]).optional(),
  from_date: z.date().optional(),
  to_date: z.date().optional()
}) 

export type GetTransactionQuery = z.infer<typeof getTransactionQuery>;