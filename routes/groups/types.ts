import { z } from 'zod';
export const baseGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_by: z.string(),
  created_at:z.string()
});

export type BaseGroupInterface = z.infer<typeof baseGroupSchema>;

export const groupsByReceiverSchema = z.object({
  receiver_id:z.number()
})

export type GroupsByReceiverInterface = z.infer<typeof groupsByReceiverSchema>;

export const groupCreationSchema = baseGroupSchema.pick({
  name: true
}).extend({
  created_by:z.number()
})

export type GroupCreationInterface = z.infer<typeof groupCreationSchema>;

export const groupCreationValidation = groupCreationSchema.omit({created_by:true})

export const sharedGRoupSchema = z.object({
  logged_in_user_id: z.number(), 
  user_id: z.number() 
})

export type SharedGroupInterface = z.infer<typeof sharedGRoupSchema>;

export const groupMemberSchema = z.object({
  user_id: z.number(),
  id: z.number(),
  full_name: z.string(),
  joined_at: z.date()
})

export type GroupMemberInterface = z.infer<typeof groupMemberSchema>;

export const groupUpdateSchema = baseGroupSchema.pick({
  id: true,
  name: true
})

export type GroupUpdateInterface = z.infer<typeof groupUpdateSchema>;

export const validateGroupUpdateSchema = groupUpdateSchema.omit({
  id:true
})

export enum ExitReason {
  SELFREMOVAL = 'Self removal',
  ADMINREMOVAL = 'Admin removal',
  RULEVIOLATION = 'Rule violation',
  OTHER = 'Other'
}

export const groupExitSchema = baseGroupSchema.pick({
  id: true
}).extend({
  user_id:z.number()
})

export type GroupExitInterface = z.infer<typeof groupExitSchema>;