import { z } from 'zod';

export const sendInviteSchema = z.object({
  sender_id:z.number(),
  group_id:z.number(),
  phone_number:z.string()
});

export type SendInviteInterface = z.infer<typeof sendInviteSchema>;

  
export const getInviteSchema = sendInviteSchema.extend({
  created_at:z.date(),
})
  
export type InviteInterface = z.infer<typeof getInviteSchema>;

export const receivedInviteSchema = sendInviteSchema
  .omit({
    phone_number: true
  })
  .extend({
    group_name:z.string(),
    sender_name:z.string(),
    created_at:z.date(),
  })

export type ReceivedInviteInterface = z.infer<typeof receivedInviteSchema>;


  
export const inviteSchema = z.object({
  group_id:z.number(),
  sender_id:z.number(),
  receiver_id:z.number(),
});
  
export const inviteResponseSchema = inviteSchema.extend({
  status:z.string()
}).omit({sender_id: true});
  
  
export type InviteResponseInterface = z.infer<typeof inviteResponseSchema>;
  
export const inviteRequestSchema = inviteResponseSchema.omit({sender_id: true, receiver_id: true});
  
export type InviteRequestInterface = z.infer<typeof inviteRequestSchema>;


export const findPendingInviteSchema = sendInviteSchema.pick({
  group_id: true,
  receiver_id: true
})

export type FindPendingInviteInterface = z.infer<typeof findPendingInviteSchema>

export const countInviteSchema = z.object({
  count:z.number()
})

export type CountInviteInterface = z.infer<typeof countInviteSchema>