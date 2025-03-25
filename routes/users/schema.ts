import { z } from 'zod';

export const entityIdParamsSchema = z.union([
  z.number().int(),
  z.literal('me').describe(
    "Identifier for user/group whose data is being fetched. Can be:\n\n" +
    "- `me`:Special id `me`to rep the currently loged in user.\n" +
    "- `A positive integer`: Represents a specific user's./ group ID."
  )])

export const UserRole = z.enum(['Admin', 'Standard', 'Moderator']);
export type Role = z.infer<typeof UserRole>;
export const IdType = z.enum(['National', 'Passport']);
const Gender = z.enum(['Male', 'Female']);

const authenticatedUser = z.object({
  id: z.number().int(),
  role: UserRole
});
export type AuthenticatedUser = z.infer<typeof authenticatedUser>;

const pinResetSchema = z.object({
  userId: z.number().int(),
  step: z.number().int()
});
export type PinResetState = z.infer<typeof pinResetSchema>;

export const userContactDetailsSchema = z.object({
  id: z.number().int(),
  full_name: z.string(),
  phone_number: z.string().regex(/^\+\d{1,4}\d{9}$/),
  created_at: z.string().datetime()
});

export const userSchema = z.object({
  id: z.number().int(),
  id_type: IdType,
  id_number: z.string().regex(/^(?:[A-Z]{1,2}\d{6,9}|\d{8,10}|\d{13}|\d{16})$/),
  role: UserRole,
  gender: Gender.optional(),
  pin: z.string().regex(/^\d{4}$/),
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
  id_type: IdType,
  id_number: z.string().regex(/^[0-9]+$/),
  created_at: z.string().datetime()
});

export const invitationSchema = z.object({
  group_id: z.number().int(),
  receiver_id: z.number().int(),
  sender_id: z.number().int(),
  xid: z.number().int(),
  status: z.enum(['Pending', 'Accept', 'Decline']),
  created_at: z.string().datetime(),
  deleted_at: z.string().datetime()
});

export type Invitation = z.infer<typeof invitationSchema>;