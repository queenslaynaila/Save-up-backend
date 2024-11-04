/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

enum Entity {
  USER = 'User',
  GROUP = 'Group',
  DONOR = 'Donor'
}
export enum Id {
  NATIONAL = 'National',
  PASSPORT = 'Passport'
}
export enum UserRole {
  ADMIN = 'Admin',
  USER = 'Standard',
  MODERATOR = 'Moderator'
}
const enumGender = z.enum(['Male', 'Female']);

const entitiesSchema = z.object({
  id: z.number().int(),
  entity_type: z.nativeEnum(Entity),
  created_at: z.string().datetime({ offset: true })
});

export const userContactDetailsSchema = z.object({
  id: z.number().int(),
  full_name: z.string(),
  phone_number: z.string().regex(/^\+254\d{9}$/),
  created_at: z.string().datetime({ offset: true })
});

export const userSchema = z.object({
  id: z.number().int(),
  id_type: z.nativeEnum(Id).default(Id.NATIONAL),
  id_number: z.string().regex(/^[0-9]+$/),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  gender: enumGender.optional(),
  pin: z.string(),
  created_at: z.string().datetime({ offset: true })
});

export const loginAttemptSchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  ip_address: z.string().optional(),
  browser_info: z.string().optional(),
  success: z.boolean(),
  reason: z.string().optional(),
  created_at: z.string().datetime({ offset: true })
});

const userRoleHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  role: z.nativeEnum(UserRole),
  created_at: z.string().datetime({ offset: true })
});

export const userPhoneHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  phone_number: z.string(),
  created_at: z.string().datetime({ offset: true })
});

export const userIdHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  id_type: z.nativeEnum(Id),
  id_number: z.string().regex(/^[0-9]+$/),
  created_at: z.string().datetime({ offset: true })
});
