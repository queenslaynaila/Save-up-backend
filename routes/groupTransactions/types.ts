import z from 'zod';
import { transactionType } from '../usertransactions/types';

export const transactionByGroup = z.object({
  group_id: z.number(),
  pocket_id: z.number(),
  user_id: z.number()
});

export type TransactionByGroup = z.infer<typeof transactionByGroup>

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
});

export type BaseTransaction = z.infer<typeof baseTransaction>

export const transactionInput = transactionByGroup.pick({
  group_id: true
});

export type TransactionInput = z.infer<typeof transactionInput>

export const transactionByPkt = transactionByGroup.pick({
  pocket_id: true,
  group_id: true
});

export type TransactionByPkt = z.infer<typeof transactionByPkt>

export const transactionDetails = z.object({
  member_name: z.string()
});

export type TransactionDetails = z.infer<typeof transactionDetails>

export const transactionRecipients = transactionByGroup.omit({
  pocket_id: true
}).extend({
  transaction_id: z.number()
});

export type TransactionRecipients = z.infer<typeof transactionRecipients>