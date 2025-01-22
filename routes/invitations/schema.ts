import { z } from 'zod';

export const invitationSchema = z.object({
  group_id: z.number().min(1),
  receiver_id: z.number().min(1),
  sender_id: z.number().min(1),
  xid: z.number().min(1),
  status: z.enum(['Pending', 'Accept', 'Decline']),
  created_at: z.string().datetime(),
  deleted_at: z.string().datetime()
});

export type Invitation = z.infer<typeof invitationSchema>;