import { z } from 'zod';



export const idSchema = z.string().uuid();
export const categorySchema = z.string();
export const statusSchema = z.string();
export const prioritySchema = z.string();

export const userSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email().optional(),  
  phone_no: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value), 'Invalid phone number format'),
  password: z.string(),
});

export const userLoginSchema = z.object({
  email: z.string().email().optional(),
  phone_no: z.string(),
  password: z.string(),
});

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
  target_date: z.date().optional(),
  status: z.string().optional(),
});
export const updateContributionsSchema = z.object({
  amount: z.number(),
  date: z.date(),
});

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
export const contributionsSchema = z.object({
  saving_id: z.string().uuid(),
  amount: z.number(),
  date: z.date(),
});

export const updateUserSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone_no: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value),'Invalid phone number format'),
});

export class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
export const usersSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone_no: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value), 'Invalid phone number format'),
  password: z.string(),
});

export const phoneSchema = z.string().uuid();
export type Phone = z.infer<typeof phoneSchema>;
export type User = z.infer<typeof usersSchema>;
export type Saving = z.infer<typeof savingSchema>;
export type Contribution = z.infer<typeof savingSchema>;
export type Expense = z.infer<typeof savingSchema>;
