/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

const enumEntityType = z.enum(['User', 'Group', 'Donor']);
const enumIdType = z.enum(['National', 'Passport']);
export enum UserRole {
  ADMIN = 'Admin',
  USER = 'Standard',
  MODERATOR = 'Moderator'
}
const enumGender = z.enum(['Male', 'Female']);

const entitiesSchema = z.object({
  id: z.number().int(),
  entity_type: enumEntityType,
  created_at: z.string().datetime({ offset: true })
});

type Entity = z.infer<typeof entitiesSchema>;

export const userContactDetailsSchema = z.object({
  id: z.number().int(),
  full_name: z.string(),
  phone_number: z.string().regex(/^\+254\d{9}$/),
  created_at: z.string().datetime({ offset: true })
});

type UserContactDetails = z.infer<typeof userContactDetailsSchema>;

export const userSchema = z.object({
  id: z.number().int(),
  id_type: enumIdType.default('National'),
  id_number: z.string().regex(/^[0-9]+$/),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  gender: enumGender.optional(),
  pin: z.string(),
  created_at: z.string().datetime({ offset: true })
});

type User = z.infer<typeof userSchema>;

export const loginAttemptSchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  ip_address: z.string().optional(),
  browser_info: z.string().optional(),
  success: z.boolean(),
  reason: z.string().optional(),
  created_at: z.string().datetime({ offset: true })
});

type LoginAttempt = z.infer<typeof loginAttemptSchema>;

const userRoleHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  created_at: z.string().datetime({ offset: true })
});

type UserRoleHistory = z.infer<typeof userRoleHistorySchema>;

const userPhoneHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  phone_number: z.string(),
  created_at: z.string().datetime({ offset: true })
});

type UserPhoneHistory = z.infer<typeof userPhoneHistorySchema>;

const userIdHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  id_type: enumIdType.default('National'),
  id_number: z.string().regex(/^[0-9]+$/),
  created_at: z.string().datetime({ offset: true })
});

type UserIdHistory = z.infer<typeof userIdHistorySchema>;