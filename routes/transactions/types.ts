import { z } from 'zod';

export const enum transactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
  TRANSFER = 'Transfer',
}

export const getTransactionsInputSchema = z.object({
  pocketId: z.number()
})

export type GetTransactionsInput = z.infer<typeof getTransactionsInputSchema>;

export const getTransactionRespSchema = z.object({
  transactionId: z.number().positive(),
  transactionType: z.enum([transactionType.DEPOSIT, transactionType.WITHDRAWAL, transactionType.TRANSFER]),
  amount: z.number(),
  transactionDate: z.string(),
  transferFrom: z.string() || null
})

export type GetTransactionResp = z.infer<typeof getTransactionRespSchema>;

export const getTransactionQuery = z.object({
  transactionType: z.enum([transactionType.DEPOSIT, transactionType.WITHDRAWAL, transactionType.TRANSFER]).optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional()
}) 

export type GetTransactionQuery = z.infer<typeof getTransactionQuery>;