import z from 'zod'
import { UserRole } from '../../globalTypes/index';

export const baseUserSchema = z.object({
  id: z.number(),
  
  id_type: z.enum(['National ID', 'Passport']),
  id_number: z.string().refine(value => /^[0-9]+$/.test(value)),    
  full_name: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR]),
  gender: z.enum(['Male', 'Female']),
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
  pin: z.string().refine((value) => /^\d{4}$/.test(value)),
  created_at: z.string()
});

export type UserType = z.infer<typeof baseUserSchema>;

export const userCreationSchema = baseUserSchema.pick({
  id_type: true,
  id_number: true,
  role: true,
  phone_number: true,
  full_name: true,
  gender: true,
  pin: true
}).extend({
  account_type: z.enum(['Admin', 'User', 'Moderator'])
});

export type UserCreationType = z.infer<typeof userCreationSchema>;

export const loginSchema = baseUserSchema.pick({
  phone_number: true,
  pin: true
})

export type LoginType = z.infer<typeof loginSchema>;

export const userByEntitySchema = z.object({
  entity: z.string(),
});

export type UserByEntityType = z.infer<typeof userByEntitySchema>;

export const userRoleUpdateSchema = z.object({
  id: z.string(),
  role: z.string()
});

export type UserRoleUpdateType = z.infer<typeof userRoleUpdateSchema>;

export const userRoleParamSchema = z.object({
  id: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR])
});

export type UserRoleParamType = z.infer<typeof userRoleParamSchema>;

export const phoneNoUpdateSchema = baseUserSchema.pick({
  phone_number: true,
  pin: true,
  id: true
})

export type PhoneNoUpdateType = z.infer<typeof phoneNoUpdateSchema>;