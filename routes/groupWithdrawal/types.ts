import { z } from 'zod';

const Recipient = z.object({
  recipient_id: z.number(),
  amount: z.number()
});

const withdrawalRequest = z.object({
  group_id: z.number().min(1),
  pocket_id: z.number().min(1),
  initiator_id: z.number(),
  amount: z.number(),
  reason: z.string(),
  recipients: z.array(Recipient)
});

export type WithdrawalRequest = z.infer<typeof withdrawalRequest>;

export const withdrawalValidation = withdrawalRequest.omit({
  initiator_id: true
});