import { z } from 'zod';
// Schemas for Saving
// ----------------------------------------------
export const idSchema = z.string().uuid();

export const savingSchema = z.object({
  user_id: z.string().uuid(),
  description: z.string(),
  category: z.string(),
  target_amount: z.number(),
  priority: z.string(),
  target_date: z.string(),
});

export const updateSavingSchema = z.object({
  description: z.string().optional(),
  category: z.string().optional(),
  target_amount: z.number().optional(),
  priority: z.string().optional(),
  target_date: z.string().optional(),
  status: z.string().optional(),
});

// Schema for Contribution
// ----------------------------------------------
export const contributionSchema = z.object({
  saving_id: z.string().uuid(),
  amount: z.number(),
  date: z.date(),
});

export const updateContributionSchema = z.object({
  amount: z.number(),
  date: z.date(),
});

// Schema for Expense
// ----------------------------------------------
export const expenseSchema = z.object({
  user_id: z.string().uuid(),
  category: z.string(),
  description: z.string(),
  amount: z.number(),
  date: z.date(),
});

export const updateExpenseSchema = z.object({
  category: z.string(),
  description: z.string(),
  amount: z.number(),
  date: z.date(),
});

// User Schemas
// ----------------------------------------------

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export const UpdateUserSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export const CreateUserSchema = UpdateUserSchema.extend({
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value), 'Invalid phone number format'),
  password: z.string(),
});

export const UserSchema = CreateUserSchema.extend({
  id: z.string().uuid(),
});

export const UserLoginSchema = CreateUserSchema.pick({
  phone_no: true,
  password: true,
});

export type User = z.infer<typeof UserSchema>;

// Category Schemas
// ----------------------------------------------
export const UpdateCategorySchema = z.object({
  name: z.string(),
  description: z.string(),
});
export const CreateCategorySchema = UpdateCategorySchema.extend({
  user_id: z.string().uuid(),
});

//Security Answer Schema
// ----------------------------------------------
export const updateSecurityAnswerSchema = z.object({
  question_id: z.string().uuid(),
  answer: z.string(),
});

export const createSecurityAnswerSchema = updateSecurityAnswerSchema.extend({
  user_id: z.string().uuid(),
});
