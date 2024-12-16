import { z } from 'zod';

const ID_TYPE_ENUM = z.enum(['National', 'Passport']);
export const USER_ROLE_ENUM = z.enum(['Admin', 'Standard', 'Moderator']);
const GENDER_ENUM = z.enum(['Male', 'Female']);

export const userContactDetailsSchema = z.object({
  id: z.number().int(),
  full_name: z.string(),
  phone_number: z.string().regex(/^\+\d{1,4}\d{9}$/),
  created_at: z.string().datetime()
});

export const userSchema = z.object({
  id: z.number().int(),
  id_type: ID_TYPE_ENUM,
  id_number: z.string().regex(/^(?:\d{8}|\d{9}(\d{4})?|\d{10}|\d{13}|\d{16})$/),
  role: USER_ROLE_ENUM,
  gender: GENDER_ENUM.optional(),
  pin: z.string(),
  created_at: z.string().datetime()
});

export const loginAttemptSchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  ip_address: z.string().optional(),
  browser_info: z.string().optional(),
  success: z.boolean(),
  reason: z.string().optional(),
  created_at: z.string().datetime()
});

export const userPhoneHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  phone_number: z.string(),
  created_at: z.string().datetime()
});

export const userIdHistorySchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  id_type: ID_TYPE_ENUM,
  id_number: z.string().regex(/^[0-9]+$/),
  created_at: z.string().datetime()
});