import { z } from 'zod';

export const groupIdParam = z.object({
  groupId: z.number()
})

export type GroupInterface = z.infer<typeof groupIdParam>;

export const entityTypeSchema = z.object({
  entityType: z.string()
})

export type EntityTypeInterface = z.infer<typeof entityTypeSchema>;

export const idRequestSchema = z.object({
  id: z.number()
})

export type IdRequestInterface = z.infer<typeof idRequestSchema>;

export const sharedGRoupSchema = z.object({
  loggedInUserId: z.number(), 
  userId: z.number() 
})

export type SharedGroupInterface = z.infer<typeof sharedGRoupSchema>;

export const baseGroupSchema = z.object({
  groupName: z.string(),
  description: z.string(), 
})
  
export const createGroupSchema = baseGroupSchema.extend({
  id: z.number(),
  createdBy:z.number()
})
  
export type CreateGroupInterface = z.infer<typeof createGroupSchema>;
  
export const commonGroupSchema = createGroupSchema.omit({ createdBy: true })
  
export type CommonGroupInterface = z.infer<typeof commonGroupSchema>;
  
export const createGroupResponse = createGroupSchema.extend({
  createdAt:z.date(),
  updatedAt:z.date()
}) 

export type CreateGroupResponseInterface = z.infer<typeof createGroupResponse>;
  
export const exitGroupSchema = z.object({
  userId: z.number(),
  groupId: z.number()
})

export type ExitGroupInterface = z.infer<typeof exitGroupSchema>;
  
export const updateGroupSchema = exitGroupSchema.pick({
  groupId: true,
}).extend({
  groupName: z.string().optional(),
  description: z.string().optional()
})

export type UpdateGroupInterface = z.infer<typeof updateGroupSchema>;
  
export const updateGroupResponseSchema = createGroupSchema.pick({
  groupName: true,
  description: true
})

export type UpdateGroupResponseInterface = z.infer<typeof updateGroupResponseSchema>;
  
export const getGroupMembers = z.object({
  userId: z.number(),
  fullName: z.string(),
  joinedAt: z.date()
})
  
export type GetGroupMembersInterface = z.infer<typeof getGroupMembers>;
  
export const nominatedAdminSchema = exitGroupSchema.extend({
  fullName: z.string(),
  nominatedAt: z.date()
})
  
export type NominatedAdminInterface = z.infer<typeof nominatedAdminSchema>;
  