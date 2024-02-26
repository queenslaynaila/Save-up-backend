import { z } from 'zod';
// Schemas for Saving
// ---------------------------------------------------------------------------------------------------------
export const idSchema = z.string().uuid();

export const savingSchema = z.object({
  user_id: z.string().uuid(),
  description: z.string(),
  category_id: z.string().uuid(),
  target_amount: z.number(),
  priority: z.string(),
  target_date: z.string(),
});

export const updateSavingSchema = z.object({
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  target_amount: z.number().optional(),
  priority: z.string().optional(),
  target_date: z.string().optional(),
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

// Extend the expenseInterface type with additional properties
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
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export const UpdateUserSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const CreateUserSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value), 'Invalid phone number format'),
  password: z.string(),
});

export const UpdatePhoneSchema = CreateUserSchema.pick({
  phone_number: true,
  password: true,
});
export const CreateAdminSchema = CreateUserSchema.extend({
  role: z.enum(['admin']),
});

export const UserSchema = CreateUserSchema.extend({
  id: z.string().uuid(),
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR]),
});

export const UserLoginSchema = CreateUserSchema.pick({
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
  created_at:Date;
  updated_at:Date;
}
//Security Question Schema
export interface SecurityQuestionSchema {
  id: z.ZodString;
  user_id: z.ZodString;
  question: z.ZodString;
  created_at:Date;
  updated_at:Date;
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
