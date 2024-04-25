import { z } from 'zod';

//METHOD ENUM
export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

//PARAMS SCHEEMAS

export const idParamSchema = z.object({
  id: z.string()
})

export type IdParamInterface = z.infer<typeof idParamSchema>;

export const getByuserSchema = z.object({
  user_id: z.number()
})

export type GetByUserInterface = z.infer<typeof getByuserSchema>

//MESSAGE RESPONSESCHEMA

export const messageSchema = z.object({
  message: z.string()
})

export type MessageInterface = z.infer<typeof messageSchema>;

// CATEGORY SCHEMAS


// SECURITY QUESTIONS & ANSWERS SCHEMA

export const securityQuestionSchema = z.object({
  id: z.number(),
  question: z.string()
})

export type SecurityQuestionInterface = z.infer<typeof securityQuestionSchema>;

export const updateSecurityAnswerSchema = securityQuestionSchema.extend({
  answer: z.string()
})

export type UpdateSecurityAnswerInterface = z.infer<typeof updateSecurityAnswerSchema>;

export const securityAnswerValidationSchema = updateSecurityAnswerSchema.pick({
  answer: true
})

// USER  SCHEMA
export const enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  MODERATOR = 'Moderator'
}

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

export const userWithRoleSchema = baseUserSchema.extend({
  role: z.enum(['Admin']).optional(),
})

export type UserWithRoleInterface = z.infer< typeof userWithRoleSchema>

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

export type ExtendedUserInterface = GetUserInterface & { pin: string };

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

export const createAdminSchema = baseUserSchema.omit({
  phone_number: true,
  national_id: true
}).extend({
  id: z.number(),
  role: z.enum(['Admin'])
});

export type CreateAdminInterface = z.infer<typeof createAdminSchema>;

export const updatedUserRoleSchema = createAdminSchema.omit({
  pin: true
})


export const userSchema = baseUserSchema.extend({
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR])
});

export const updateUserPhoneSchema = baseUserSchema.pick({
  pin: true,
  phone_number: true,
})

export type UpdatePhoneInterface = z.infer<typeof updateUserPhoneSchema>;

// SECURITY ANSWER SCHEMAS

export const createSecurityAnswerSchema = z.object({
  user_id: z.number(),
  question_id: z.number(),
  answer: z.string()
});

export type CreateSecurityAnswerInterface = z.infer<typeof createSecurityAnswerSchema>;

export const securityAnswerRequestSchema = createSecurityAnswerSchema.omit({ user_id: true});

export const securityAnswerSchema = createSecurityAnswerSchema.extend({
  id: z.number(),
  created_at: z.date()
})

export type SecurityAnswerInterface = z.infer<typeof securityAnswerSchema>;

// GROUPS SCHEMA


// GOAL SCHEMAS

export const idSchema = z.object({
  id: z.number()
});
export type IdInterface = z.infer<typeof idSchema>;
export const ID_SCHEMA = z.number();




// EXPENSES SCHEMAS


//SECURITY QUESTION SCHEMA
export const securityQuestionsSchema =  z.object({
  question_id: z.number().positive(),
  question: z.string(),
});

export type SecurityQuestions = z.infer<typeof securityQuestionsSchema>;


//GROUP ADMIN SCHEMA



////////////////////////////////////////////////////////////////////////////////

