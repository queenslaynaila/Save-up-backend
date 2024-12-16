import * as z from 'zod';

const CreateGroupDepositSchema = z.object({
  group_id: z.number().min(1),
  user_id: z.number().min(1),
  pocket_id: z.number().min(1),
  amount: z.number()
});

export type GroupDeposit = z.infer<typeof CreateGroupDepositSchema>;

export const depositByGroup = CreateGroupDepositSchema.omit({
  user_id: true
});