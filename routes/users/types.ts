import z from 'zod'
import { UserRole } from '../../globalTypes/index';

export const baseUserSchema = z.object({
  full_name: z.string(),
  gender: z.enum(['Male', 'Female']),
  id_type: z.enum(['National ID', 'Passport']),
  id_number: z.string().refine(value => /^[0-9]+$/.test(value)),            
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
  pin: z.string().refine((value) => /^\d{4}$/.test(value)),
});
  
export type UserInterface = z.infer<typeof baseUserSchema>;

export const createNewUserSchema = baseUserSchema.extend({
  entity_type: z.literal('User')
})

export type CreateNewUserInterface = z.infer<typeof createNewUserSchema>;

export const createUserContactSchema = baseUserSchema.pick({
  id_number : true,
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

export type ExtendedUserInterface = GetUserInterface & { 
  pin: string,
  id_type:string,
  id_number:string,
  phone_number:string
};

export const targetParamSchema = z.object({
  entity: z.string()
})

export type TargetParamInterface = z.infer<typeof targetParamSchema>;