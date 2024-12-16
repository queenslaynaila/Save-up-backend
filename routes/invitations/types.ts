import { z } from 'zod';

export const baseInviteSchema = z.object({
  group_id: z.number(),
  sender_id: z.number(),
  sender_name: z.string(),
  group_name: z.string(),
  created_at: z.date()
});

export type baseInviteInterface = z.infer<typeof baseInviteSchema>;

const inviteInputSchema = baseInviteSchema
  .pick({
    group_id: true,
    sender_id: true
  })
  .extend({
    phone_number: z.string()
  });

export const userInviteSchema = inviteInputSchema.omit({
  sender_id: true
});

export type InviteInputInterface = z.infer<typeof inviteInputSchema>;

const inviteResponseSchema = z.object({
  group_id: z.number(),
  receiver_id: z.number(),
  status: z.string()
});

export type InviteResponseInterface = z.infer<typeof inviteResponseSchema>;

export const inviteValidationSchema = inviteResponseSchema.omit({
  receiver_id: true
});