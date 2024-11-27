import { z } from 'zod';

const resetTokenSchema = z.object({
  user_id: z.number(),
  xid: z.number(),
  token: z.string(),
  reason: z.enum(['Reset', 'Update', 'Unlock']),
  created_at: z.string(),
  used_at: z.string().optional(),
  expired_at: z.string()
});

export type ResetToken = z.infer<typeof resetTokenSchema>;