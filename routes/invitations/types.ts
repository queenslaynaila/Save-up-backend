import { z } from 'zod';

export const sendInviteSchema = z.object({
  receiverId:z.number(),
  senderId:z.number(),
  groupId:z.number(),
});
  
export const getInviteSchema = sendInviteSchema.extend({
  createdAt:z.date(),
})
  
export type InviteInterface = z.infer<typeof getInviteSchema>;
  
export type SendInviteInterface = z.infer<typeof sendInviteSchema>;
  
export const inviteSchema = z.object({
  groupId:z.number(),
  senderId:z.number(),
  receiverId:z.number(),
});
  
export const inviteResponseSchema = inviteSchema.extend({
  status:z.string()
}).omit({senderId: true});
  
  
export type InviteResponseInterface = z.infer<typeof inviteResponseSchema>;
  
export const inviteRequestSchema = inviteResponseSchema.omit({senderId: true, receiverId: true});
  
export type InviteRequestInterface = z.infer<typeof inviteRequestSchema>;

export const getUserInvitesSchema = sendInviteSchema.pick({
  receiverId: true
})

export type GetInvitesInterface = z.infer<typeof getUserInvitesSchema>

export const idParamSchema = z.object({
  groupId: z.string()
})

export type GroupIdParamInterface = z.infer<typeof idParamSchema>;

export const getUserByPhoneSchema = z.object({
  phoneNumber: z.string()
})

export type GetUserByPhoneInterface = z.infer<typeof getUserByPhoneSchema>

export const findPendingInviteSchema = sendInviteSchema.pick({
  groupId: true,
  receiverId: true
})

export type FindPendingInviteInterface = z.infer<typeof findPendingInviteSchema>

export const countInviteSchema = z.object({
  count:z.number()
})

export type CountInviteInterface = z.infer<typeof countInviteSchema>