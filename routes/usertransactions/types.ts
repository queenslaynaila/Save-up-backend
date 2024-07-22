import { z } from 'zod';

export const transactionByUser = z.object({
  user_id: z.number(),
  pocket_id: z.string()
})

export type TransactionByUser = z.infer<typeof transactionByUser>;

export const transactionBody = transactionByUser.omit({
  user_id: true
})

export type TransactionBody = z.infer<typeof transactionBody>;

export const transactionType = {
  SAVING: 'Saving',
  EXTERNAL_SAVING: 'ExternalSaving',
  WITHDRAWAL: 'Withdrawal',
  TRANSFER_IN: 'TransferIn',
  TRANSFER_OUT: 'TransferOut'
};

export const baseTransaction = z.object({
  transaction_id: z.number().positive(),
  transaction_type: z.enum([
    transactionType.SAVING,
    transactionType.EXTERNAL_SAVING,
    transactionType.WITHDRAWAL,
    transactionType.TRANSFER_IN,
    transactionType.TRANSFER_OUT
  ]),
  amount: z.number(),
  current_balance: z.number().positive(),
  transaction_date: z.date()
})

export type BaseTransaction = z.infer<typeof baseTransaction>;

export const transactionQueryParams = baseTransaction.pick({
  transaction_type: true
}).extend({
  from_date:z.string(),
  to_date:z.string()
}).partial(); 

export type TransactionQueryParams = z.infer<typeof transactionQueryParams>;