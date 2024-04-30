import { z } from 'zod';

export const groupIdParam = z.object({
  group_id: z.number()
})

export type GroupInterface = z.infer<typeof groupIdParam>;

export const entityTypeSchema = z.object({
  entity_type: z.string()
})

export type EntityTypeInterface = z.infer<typeof entityTypeSchema>;

export const idRequestSchema = z.object({
  id: z.number()
})

export type IdRequestInterface = z.infer<typeof idRequestSchema>;

export const sharedGRoupSchema = z.object({
  logged_in_user_id: z.number(), 
  user_id: z.number() 
})

export type SharedGroupInterface = z.infer<typeof sharedGRoupSchema>;

export const baseGroupSchema = z.object({
  group_name: z.string(),
  description: z.string(), 
})
  
export const createGroupSchema = baseGroupSchema.extend({
  id: z.number(),
  created_by:z.number()
})
  
export type CreateGroupInterface = z.infer<typeof createGroupSchema>;
  
export const commonGroupSchema = createGroupSchema.omit({ created_by: true })
  
export type CommonGroupInterface = z.infer<typeof commonGroupSchema>;
  
export const createGroupResponse = createGroupSchema.extend({
  created_at:z.date(),
  updated_at:z.date()
}) 

export type CreateGroupResponseInterface = z.infer<typeof createGroupResponse>;
  
export const exitGroupSchema = z.object({
  user_id: z.number(),
  group_id: z.number()
})

export type ExitGroupInterface = z.infer<typeof exitGroupSchema>;
  
export const updateGroupSchema = exitGroupSchema.pick({
  group_id: true,
}).extend({
  group_name: z.string().optional(),
  description: z.string().optional()
})

export type UpdateGroupInterface = z.infer<typeof updateGroupSchema>;
  
export const updateGroupResponseSchema = createGroupSchema.pick({
  group_name: true,
  description: true
})

export type UpdateGroupResponseInterface = z.infer<typeof updateGroupResponseSchema>;
  
export const getGroupMembers = z.object({
  user_id: z.number(),
  full_name: z.string(),
  joined_at: z.date()
})
  
export type GetGroupMembersInterface = z.infer<typeof getGroupMembers>;
  
export const nominatedAdminSchema = exitGroupSchema.extend({
  full_name: z.string(),
  nominated_at: z.date()
})
  
export type NominatedAdminInterface = z.infer<typeof nominatedAdminSchema>;
  