import { z } from 'zod';
import { UserRole } from '../../globalTypes';

const ENTITY_TYPE_ENUM = z.enum(['User', 'Group', 'Donor']);
const ID_TYPE_ENUM = z.enum(['National ID', 'Passport']);
const USER_ROLE_ENUM = z.enum(['Admin', 'Standard', 'Moderator']);
const GENDER_ENUM = z.enum(['Male', 'Female']);

const entitySchema = z.object({
  id: z.number().int(),
  entity_type: ENTITY_TYPE_ENUM,
  created_at: z.string().datetime(),
});
type Entity = z.infer<typeof entitySchema>;

const userContactDetailsSchema = z.object({
  id: z.number().int(),
  full_name: z.string(),
  phone_number: z.string(),
  created_at: z.string().datetime(),
});
type UserContactDetails = z.infer<typeof userContactDetailsSchema>;

const userSchema = z.object({
  id: z.number().int(),
  id_type: ID_TYPE_ENUM.default('National ID'),
  id_number: z.string().regex(/^[0-9]+$/),
  role:z.nativeEnum(UserRole),
  gender: GENDER_ENUM.optional(),
  pin: z.string(),
  created_at: z.string().datetime(),
});
type User = z.infer<typeof userSchema>;

const loginAttemptSchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  ip_address: z.string().optional(),
  browser_info: z.string().optional(),
  success: z.boolean(),
  reason: z.string().optional(),
  created_at: z.string().datetime(),
});
type LoginAttempt = z.infer<typeof loginAttemptSchema>;

const userRoleHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  role: USER_ROLE_ENUM,
  created_at: z.string().datetime(),
});
type UserRoleHistory = z.infer<typeof userRoleHistorySchema>;

const userPhoneHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  phone_number: z.string(),
  created_at: z.string().datetime(),
});
type UserPhoneHistory = z.infer<typeof userPhoneHistorySchema>;
const userIdHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  id_type: ID_TYPE_ENUM.default('National ID'),
  id_number: z.string().regex(/^[0-9]+$/),
  created_at: z.string().datetime(),
});
type UserIdHistory = z.infer<typeof userIdHistorySchema>;

export {  
  entitySchema, Entity, userContactDetailsSchema, UserContactDetails, userSchema, 
  User, loginAttemptSchema, LoginAttempt, userRoleHistorySchema, UserRoleHistory, 
  userPhoneHistorySchema, UserPhoneHistory, userIdHistorySchema, UserIdHistory, 
  ENTITY_TYPE_ENUM, ID_TYPE_ENUM, USER_ROLE_ENUM, GENDER_ENUM
};