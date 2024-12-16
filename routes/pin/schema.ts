import { z } from 'zod';

const resetTokenSchema = z.object({
  user_id: z.number().min(1),
  xid: z.number().min(1),
  token: z.string(),
  reason: z.enum(['Reset', 'Update', 'Unlock']),
  created_at: z.string(),
  used_at: z.string().optional(),
  expired_at: z.string()
});

export type ResetToken = z.infer<typeof resetTokenSchema>;