import { z } from 'zod';

const Recipient = z.object({
  recipient_id: z.number().int().min(1),
  amount: z.number()
});

const withdrawalRequest = z.object({
  group_id: z.number().int().min(1),
  pocket_id: z.number().int().min(1),
  initiator_id: z.number().int().min(1),
  amount: z.number().int().min(1),
  reason: z.string(),
  recipients: z.array(Recipient)
});

export type WithdrawalRequest = z.infer<typeof withdrawalRequest>;