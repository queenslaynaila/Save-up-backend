import { z } from 'zod';
// Schemas for Saving
// ---------------------------------------------------------------------------------------------------------
export const idSchema = z.string().uuid();

export const enum priority {
  HIGH = 'High',
  INTERMEDIATE = 'Intermediate',
  LOW = 'Low',
}
export const baseSavingSchema = z.object({
  description: z.string(),
  category_id: z.string().uuid(),
  amount: z.number(),
  priority: z.enum([priority.HIGH, priority.INTERMEDIATE, priority.LOW]),
  target_date: z.string(),
});

export const savingSchema = baseSavingSchema.extend({
  user_id: z.string().uuid(),
});

export const updateSavingSchema = baseSavingSchema.partial();

export const getSavingsQueryParamsSchema = z.object({
  user_id: z.string().uuid(),
  priority: z.string().optional(),
  status: z.string().optional(),
});

// Schema for Contribution
// ---------------------------------------------------------------------------------------------------------
export const contributionSchema = z.object({
  saving_id: z.string().uuid(),
  amount: z.number(),
  date: z.string(),
});

export const updateContributionSchema = contributionSchema.pick({
  amount: true,
  date: true,
});

export interface ContributionSchema {
  saving_id: z.ZodString;
  amount: z.ZodNumber;
  date: z.ZodString;
  created_at: Date;
  updated_at: Date;
}

// Schema for Expense
// ---------------------------------------------------------------------------------------------------------
export const expenseSchema = z.object({
  user_id: z.string().uuid(),
  category_id: z.string().uuid(),
  description: z.string(),
  amount: z.number(),
  date: z.string(),
});

export type expenseInterface = z.infer<typeof expenseSchema>;

export interface ExtendedExpenseInterface extends expenseInterface {
  created_at: string;
  updated_at: string;
  month: string;
}
export const updateExpenseSchema = z.object({
  category_id: z.string().uuid().optional(),
  description: z.string().optional(),
  amount: z.number().optional(),
  date: z.string().optional(),
});

// User Schemas
// ---------------------------------------------------------------------------------------------------------
export const enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  MODERATOR = 'Moderator',
}

const BaseUserSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
});

export const CreateUserSchema = BaseUserSchema.extend({
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value), 'Invalid phone number format'),
  password: z.string(),
});

export const UpdateUserSchema = BaseUserSchema.partial();

export const CreateAdminSchema = CreateUserSchema.extend({
  role: z.enum(['Admin']),
});

export const UserSchema = CreateUserSchema.extend({
  id: z.string().uuid(),
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR]),
});

export const UserLoginSchema = CreateUserSchema.pick({
  phone_number: true,
  password: true,
});

export const UpdatePhoneSchema = CreateUserSchema.pick({
  phone_number: true,
  password: true,
});

export type Admin = z.infer<typeof UserSchema>;
export type User = z.infer<typeof UserSchema>;

// Category Schemas
// ----------------------------------------------------------------------------------------------------------
export const UpdateCategorySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});
export const CreateCategorySchema = UpdateCategorySchema.extend({
  user_id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
});

export interface CategorySchema {
  id: z.ZodString;
  description: z.ZodString;
  name: z.ZodString;
  user_id: z.ZodString;
  created_at: Date;
  updated_at: Date;
}
//Security Question Schema
export interface SecurityQuestionSchema {
  id: z.ZodString;
  user_id: z.ZodString;
  question: z.ZodString;
  created_at: Date;
  updated_at: Date;
}

//Security Answer Schema
// ---------------------------------------------------------------------------------------------------------
export const updateSecurityAnswerSchema = z.object({
  question_id: z.string().uuid(),
  answer: z.string(),
});

export const createSecurityAnswerSchema = updateSecurityAnswerSchema.extend({
  user_id: z.string().uuid(),
});

export interface SecurityAnswerSchema {
  id: string;
  user_id: string;
  question_id: string;
  answer: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSchema {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}
