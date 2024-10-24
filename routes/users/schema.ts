import { z } from 'zod';
import { UserRole } from '../../globalTypes';

export const ENTITY_TYPE_ENUM = z.enum(['User', 'Group', 'Donor']);
export const ID_TYPE_ENUM = z.enum(['National', 'Passport']);
export const USER_ROLE_ENUM = z.enum(['Admin', 'Standard', 'Moderator']);
export const GENDER_ENUM = z.enum(['Male', 'Female']);

export const entitySchema = z.object({
  id: z.number().int(),
  entity_type: ENTITY_TYPE_ENUM,
  created_at: z.string().datetime()
});
export type Entity = z.infer<typeof entitySchema>;

export const userContactDetailsSchema = z.object({
  id: z.number().int(),
  full_name: z.string(),
  phone_number: z.string(),
  created_at: z.string().datetime()
});
export type UserContactDetails = z.infer<typeof userContactDetailsSchema>;

export const userSchema = z.object({
  id: z.number().int(),
  id_type: ID_TYPE_ENUM.default('National'),
  id_number: z.string().regex(/^[0-9]+$/),
  role: z.nativeEnum(UserRole),
  gender: GENDER_ENUM.optional(),
  pin: z.string(),
  created_at: z.string().datetime()
});
export type User = z.infer<typeof userSchema>;

export const loginAttemptSchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  ip_address: z.string().optional(),
  browser_info: z.string().optional(),
  success: z.boolean(),
  reason: z.string().optional(),
  created_at: z.string().datetime()
});
export type LoginAttempt = z.infer<typeof loginAttemptSchema>;

export const userRoleHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  role: USER_ROLE_ENUM,
  created_at: z.string().datetime()
});
export type UserRoleHistory = z.infer<typeof userRoleHistorySchema>;

export const userPhoneHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  phone_number: z.string(),
  created_at: z.string().datetime()
});
export type UserPhoneHistory = z.infer<typeof userPhoneHistorySchema>;

export const userIdHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  id_type: ID_TYPE_ENUM.default('National'),
  id_number: z.string().regex(/^[0-9]+$/),
  created_at: z.string().datetime()
});
export type UserIdHistory = z.infer<typeof userIdHistorySchema>;

export const UserIdParamSchema = z.object({
  user_id: z.string().min(1, 'User ID is required')
});
export type UserId = z.infer<typeof UserIdParamSchema>;