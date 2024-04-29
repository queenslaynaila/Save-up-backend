import z from 'zod'
import { UserRole } from '../../globalTypes/index';

export const baseUserSchema = z.object({
  fullName: z.string(),
  gender: z.enum(['Male', 'Female', 'Prefer not to say']),
  nationalId: z.number().int().min(10000000).max(99999999),                
  phoneNumber: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
  pin: z.string().refine((value) => /^\d{4}$/.test(value)),
});
  
export type UserInterface = z.infer<typeof baseUserSchema>;

export const createUserContactSchema = baseUserSchema.pick({
  nationalId: true,
  phoneNumber: true
}).extend({
  entityId: z.number()
})
  
export type CreateUserContactInterface = z.infer<typeof createUserContactSchema>;

export const createUserSchema = baseUserSchema.pick({
  fullName: true,
  gender: true,
  pin : true
}).extend({
  id: z.number()
});

export type CreateUserInterface = z.infer<typeof createUserSchema>;

export const GetUserSchema = createUserSchema.pick({
  id: true,
  fullName: true,
  gender: true,
}).extend({
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR]),
  createdAt: z.string()
})
  
export type GetUserInterface = z.infer<typeof GetUserSchema>;

export const getUserQuery = GetUserSchema.pick({
  role: true
}).partial()

export type GetUserQueryInterface = z.infer<typeof getUserQuery>;

export const updateUserPhoneSchema = baseUserSchema.pick({
  pin: true,
  phoneNumber: true,
})
  
export type UpdatePhoneInterface = z.infer<typeof updateUserPhoneSchema>;

export type ExtendedUserInterface = GetUserInterface & { pin: string };