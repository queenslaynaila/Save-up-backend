import z from 'zod'
import { UserRole } from '../../globalTypes/index';

export const baseUserSchema = z.object({
  full_name: z.string(),
  gender: z.enum(['Male', 'Female', 'Prefer not to say']),
  national_id: z.number().int().min(10000000).max(99999999),                
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
  pin: z.string().refine((value) => /^\d{4}$/.test(value)),
});
  
export type UserInterface = z.infer<typeof baseUserSchema>;

export const createUserContactSchema = baseUserSchema.pick({
  national_id: true,
  phone_number: true
}).extend({
  entity_id: z.number()
})
  
export type CreateUserContactInterface = z.infer<typeof createUserContactSchema>;

export const createUserSchema = baseUserSchema.pick({
  full_name: true,
  gender: true,
  pin : true
}).extend({
  id: z.number()
});

export type CreateUserInterface = z.infer<typeof createUserSchema>;

export const GetUserSchema = createUserSchema.pick({
  id: true,
  full_name: true,
  gender: true,
}).extend({
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR]),
  created_at: z.string()
})
  
export type GetUserInterface = z.infer<typeof GetUserSchema>;

export const getUserQuery = GetUserSchema.pick({
  role: true
}).partial()

export type GetUserQueryInterface = z.infer<typeof getUserQuery>;

export const updateUserPhoneSchema = baseUserSchema.pick({
  pin: true,
  phone_number: true,
})
  
export type UpdatePhoneInterface = z.infer<typeof updateUserPhoneSchema>;

export type ExtendedUserInterface = GetUserInterface & { pin: string };