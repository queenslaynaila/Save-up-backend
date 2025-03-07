import { z } from "zod";

const ENUM_TRANSACTION_TYPE = z.enum([
    'Saving',
    'ExternalSaving',
    'Interest',
    'Withdrawal',
    'Penalty',
    'TransferIn',
    'TransferOut',
    'Loan',
    'Repayment'
  ]);

export const transactionTypeSchema = z.object({
    id: z.number(),
    slug: ENUM_TRANSACTION_TYPE,
    created_at: z.string().datetime()
  });
  
  export const transactionSchema = z.object({
    entity_id: z.number().min(1),
    xid: z.number().min(1),
    type_id: z.number(),
    pocket_id: z.number().min(1),
    reference_id: z.number(),
    delta: z.number().min(5),
    balance: z.number(),
    created_at: z.string().datetime()
  });