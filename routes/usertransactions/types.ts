import { z } from 'zod';

export const transactionType = {
  SAVING: 'Saving',
  EXTERNAL_SAVING: 'ExternalSaving',
  WITHDRAWAL: 'Withdrawal',
  TRANSFER_IN: 'TransferIn',
  TRANSFER_OUT: 'TransferOut'
};

export const getByEntitySchema = z.object({
  entity_id: z.number().optional()
})

export type TransactionByEntity = z.infer<typeof getByEntitySchema>;

export const baseTransactionSchema = z.object({
  transaction_id: z.number().positive(),
  transaction_type: z.enum([
    transactionType.SAVING,
    transactionType.EXTERNAL_SAVING,
    transactionType.WITHDRAWAL,
    transactionType.TRANSFER_IN,
    transactionType.TRANSFER_OUT
  ]),
  reference_no: z.string(),
  amount: z.number(),
  current_balance: z.number().positive(),
  transaction_date: z.date()
})

export type BaseTransaction = z.infer<typeof baseTransactionSchema>;


export const getTransactionsInputSchema =z.object({
  user_id: z.number(),
  pocket_id: z.string()
})

export type TransactionInput = z.infer<typeof getTransactionsInputSchema>;

export const transactionQueryParams = baseTransactionSchema.pick({
  transaction_type: true,
}).extend({
  pocket_id: z.string(),
  from_date:z.string(),
  to_date:z.string()
}) 

export type  TransactionQueryParams = z.infer<typeof transactionQueryParams>;