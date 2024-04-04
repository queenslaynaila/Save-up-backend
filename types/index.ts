import { z } from 'zod';
// Schemas for Saving
// ---------------------------------------------------------------------------------------------------------

export const ID_SCHEMA = z.number();
export const enum priority {
  HIGH = 'High',
  INTERMEDIATE = 'Intermediate',
  LOW = 'Low',
}
export const baseSavingSchema = z.object({
  description: z.string(),
  category_id: z.number(),
  amount: z.number(),
  priority: z.enum([priority.HIGH, priority.INTERMEDIATE, priority.LOW]),
  target_at: z.string(),
});

export const savingSchema = baseSavingSchema.extend({
  user_id: z.number(),
});

export const updateSavingSchema = baseSavingSchema.partial();

export const getSavingsQueryParamsSchema = z.object({
  user_id: z.number(),
  priority: z.string().optional(),
  status: z.string().optional(),
});

// Schema for Contribution
// ---------------------------------------------------------------------------------------------------------
export const contributionSchema = z.object({
  user_id: z.number(),
  saving_id: z.number(),
  amount: z.number(),
  date: z.string(),
});

export type ContributionSchema = {
  user_id:number,
  saving_id:number,
  amount: number,
  date: string,
  created_at: Date
}

// Schema for Expense
// ---------------------------------------------------------------------------------------------------------
export const expenseSchema = z.object({
  user_id: z.number(),
  category_id: z.number(),
  description: z.string(),
  amount: z.number(),
  expense_date: z.string(),
});

export type expenseInterface = z.infer<typeof expenseSchema>;

export interface ExtendedExpenseInterface extends expenseInterface {
  created_at: string;
  deleted_at: string;
}
export const updateExpenseSchema = z.object({
  category_id: z.number().optional(),
  description: z.string().optional(),
  amount: z.number().optional(),
  expense_date: z.string().optional(),
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
  id: z.number(),
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
  user_id: z.number(),
  name: z.string(),
  description: z.string(),
});

export type CategorySchema ={
  user_id: z.ZodString;
  id: z.ZodNumber;
  name: z.ZodString;
  description: z.ZodString;
  created_at: Date;
  deleted_at: Date;
}
//Security Question Schema
export interface SecurityQuestionSchema {
  id: z.ZodNumber;
  question: z.ZodString;
  created_at: Date;
}

//Security Answer Schema
// ---------------------------------------------------------------------------------------------------------
export const updateSecurityAnswerSchema = z.object({
  question_id: z.number(),
  answer: z.string(),
});

export const createSecurityAnswerSchema = updateSecurityAnswerSchema.extend({
  user_id: z.number(),
});

export interface SecurityAnswerSchema {
  id: string;
  user_id: number;
  question_id: string;
  answer: string;
  created_at: Date;
}

export interface UserSchema {
  id: number;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: Date;
}

// NEXT OF KIN SCHEMA
// ---------------------------------------------------------------------------------------------------------
export const NextOfKinSchema = z.object({
  user_id:z.number(),
  full_name: z.string(),
  relationship: z.string(),
  email: z.string().email()
});

export const ExtendedNextOfKinSchema= NextOfKinSchema.extend({
  created_at: z.string(),
  updated_at: z.string()
})

// GROUPS SCHEMA
// ---------------------------------------------------------------------------------------------------------

export const CreateGroupSchema = z.object({
  name: z.string(),
  description: z.string(), 
  created_by:z.number(),
});
export type CreateGroupInterface = z.infer<typeof CreateGroupSchema>;

export const CreateGroupResponse = z.object({
  id:z.number(),
  name: z.string(),
  description: z.string(), 
  created_by:z.string(),
  created_at:z.string(),
  updated_at:z.string()
});

export type CreateGroupResponseInterface = z.infer<typeof CreateGroupResponse>;


export const CreateGroupGoalSchema = z.object({
  group_id: z.string(),
  category_id:z.number(),
  description: z.string(), 
  target_amount:z.number(),
  priority: z.string(),
  target_at:z.date(),
});

export type CreateGroupGoalInterface = z.infer<typeof CreateGroupGoalSchema>;

export const CreateGroupGoalResponse = z.object({
  id:z.number(),
  name: z.string(),
  description: z.string(), 
  created_by:z.string(),
  created_at:z.string(),
  updated_at:z.string()
});

export type CreateGroupGoalResponseInterface = z.infer<typeof CreateGroupGoalResponse>;

export const  GetGroupGoalsSchema = CreateGroupGoalSchema.pick({
  group_id: true,
});

export const GetGroupGoalsResponse = z.object({
  id: z.number(),
  owner_id: z.number(),
  category_id: z.number(),
  description: z.string(),
  target_amount: z.number(),
  priority: z.string(),
  target_at: z.string(),
});

export type GetGroupGoalsResponseInterface = z.infer<typeof GetGroupGoalsResponse>;

export type GetGroupGoalsInterface = z.infer<typeof GetGroupGoalsSchema>;

export const ExitGroupSchema = z.object({
  group_id: z.number(),
  user_id: z.number(),
});

export type ExitGroupInterface = z.infer<typeof ExitGroupSchema>;


export const UpdateGroupSchema = z.object({
  group_id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateGroupInterface = z.infer<typeof UpdateGroupSchema>;

// INVITE SCHEMA
// ---------------------------------------------------------------------------------------------------------

export const SendInviteSchema = z.object({
  receiver_id:z.number(),
  sender_id:z.number(),
  group_id:z.number(),
});

export type SendInviteInterface = z.infer<typeof SendInviteSchema>;

export const InviteSchema = z.object({
  group_id:z.number(),
  sender_id:z.number(),
  receiver_id:z.number(),
});

export const InviteResponseSchema = InviteSchema.extend({
  status:z.string()
}).omit({sender_id: true});

export type InviteResponseInterface = z.infer<typeof InviteResponseSchema>;

export const ElectionSchema = z.object({
  group_id:z.number(),
  caller_id:z.number(),
  election_name:z.string(),
  start_at:z.date(),
  end_at:z.date()
});

export type ElectionInterface = z.infer<typeof ElectionSchema>;

export interface ElectionResponse {
  id: number;
  group_id: number;
  election_name: string;
  caller_id: number;
  start_at: Date;
  end_at: Date;
  created_at: Date;
}


export const ElectionVoteSchema = z.object({
  election_id: z.number(), 
  candidate_id: z.number(), 
  voter_id: z.number(),
  group_id: z.number(), 
});

export type ElectionVoteInterface = z.infer<typeof ElectionVoteSchema>;

export interface ElectionCandidateSchema {
  election_id: number;
  candidate_id: number;
}

export const  ElectionCandidateSchema = z.object({
  election_id: z.number(),
  candidate_id: z.number()
});

export interface ElectionCandidateResponse {
  election_id: number;
  candidate_id: number;
  votes: number;
  created_at: Date;
}
