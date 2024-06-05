import { z } from 'zod';

export const transactionType = {
  SAVING: 'Saving',
  EXTERNAL_SAVING: 'External Saving',
  WITHDRAWAL: 'Withdrawal',
  TRANSFER_IN: 'Transfer In',
  TRANSFER_OUT: 'Transfer Out'
};

export const getByEntitySchema = z.object({
  entity_id: z.number().optional()
})

export type GetByEntity = z.infer<typeof getByEntitySchema>;

export const getTransactionsInputSchema = getByEntitySchema
  .required()
  .extend({
    pocket_id: z.string()
  })

export type GetTransactionsInput = z.infer<typeof getTransactionsInputSchema>;

export const getTransactionRespSchema = z.object({
  transaction_id: z.number().positive(),
  transaction_type: z.enum([
    transactionType.SAVING,
    transactionType.EXTERNAL_SAVING,
    transactionType.WITHDRAWAL,
    transactionType.TRANSFER_IN,
    transactionType.TRANSFER_OUT
  ]),
  amount: z.number(),
  reference_no: z.string(),
  cumulative_amount: z.number(),
  transaction_date: z.date()
});

export type GetTransactionResp = z.infer<typeof getTransactionRespSchema>;

export const getTransactionQuery = z.object({
  transaction_type: z.enum([
    transactionType.SAVING,
    transactionType.EXTERNAL_SAVING,
    transactionType.WITHDRAWAL,
    transactionType.TRANSFER_IN,
    transactionType.TRANSFER_OUT
  ]).optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional()
});

export type GetTransactionQuery = z.infer<typeof getTransactionQuery>;