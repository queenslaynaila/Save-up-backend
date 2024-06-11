import { z } from 'zod';

export const inviteByReceiverSchema = z.object({
  receiver_id:z.number()
})

export type InviteByReceiverInterface = z.infer<typeof inviteByReceiverSchema>;

export const baseInviteSchema = z.object({
  group_id:z.number(),
  sender_id:z.number(),
  sender_name:z.string(),
  group_name:z.string(),
  created_at:z.date()
});

export type baseInviteInterface = z.infer<typeof baseInviteSchema>;

export const inviteInputSchema = baseInviteSchema
  .pick({
    group_id:true,
    sender_id: true
  })
  .extend({
    phone_number:z.string(),
  })

export type InviteInputInterface = z.infer<typeof inviteInputSchema>;

export const inviteResponseSchema = z.object({
  group_id:z.number(),
  receiver_id:z.number(),
  status:z.string()
})

export type InviteResponseInterface = z.infer<typeof inviteResponseSchema>;

export const inviteValidationSchema = inviteResponseSchema.pick({
  group_id: true,
  status: true
})