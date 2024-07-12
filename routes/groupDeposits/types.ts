import * as z from 'zod';

export const CreateGroupDepositSchema = z.object({
  group_id: z.number(),
  user_id: z.number(),
  pocket_id: z.number(),
  amount: z.number()
});

export type GroupDeposit = z.infer<typeof CreateGroupDepositSchema>;

export const depositByGroup = CreateGroupDepositSchema.omit({
  user_id: true
});

export type DepositByGroup = z.infer<typeof depositByGroup>;