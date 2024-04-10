import { z } from 'zod';

// CATEGORY SCHEMAS
export const CreateCategorySchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type CreateCategoryInterface = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.extend({
  id: z.number(),
})

export type UpdateCategoryInterface = z.infer<typeof UpdateCategorySchema>;

export const CategorySchema = UpdateCategorySchema.extend({
  created_at: z.date()
})

export type CategoryInterface = z.infer<typeof CategorySchema>;

// SECURITY QUESTIONS SCHEMA
export interface SecurityQuestionSchema {
  id: z.ZodNumber;
  question: z.ZodString;
  created_at: Date;
}

// USER  SCHEMA
export const enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  MODERATOR = 'Moderator'
}

export const BaseUserSchema = z.object({
  full_name: z.string(),
  gender: z.enum(['Male', 'Female', 'Prefer not to say']),
  national_id: z.number(),
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
  pin:z.string()
});

export type UserInterface = z.infer<typeof BaseUserSchema>;

export const CreateUserContactSchema = BaseUserSchema.pick({
  national_id: true,
  phone_number: true
}).extend({
  entity_id: z.number()
})

export type CreateUserContactInterface = z.infer<typeof CreateUserContactSchema>;

export const CreateUserSchema = BaseUserSchema.pick({
  full_name: true,
  gender: true,
  pin : true
}).extend({
  id: z.number()
});

export type CreateUserInterface = z.infer<typeof CreateUserSchema>;

export const GetUserSchema = CreateUserSchema.pick({
  id: true,
  full_name: true,
  gender: true,
}).extend({
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR]),
  created_at: z.string()
})

export type GetUserInterface = z.infer<typeof GetUserSchema>;

export const CreateAdminSchema = BaseUserSchema.extend({
  role: z.enum(['Admin'])
});

export const UserSchema = BaseUserSchema.extend({
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR])
});

export const UpdateUserPhoneSchema = BaseUserSchema.pick({
  pin: true,
  phone_number: true,
})

export type UpdatePhoneInterface = z.infer<typeof UpdateUserPhoneSchema>;

// NEXT OF KIN SCHEMAS
export const CreateNextOfKinSchema = z.object({
  user_id:z.number(),
  full_name: z.string(),
  relationship: z.string(),
  email: z.string().email(),
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
});

export type CreateNextOfKinInterface = z.infer<typeof CreateNextOfKinSchema>;

export const NextOfKinSchema= CreateNextOfKinSchema
  .omit({ user_id: true })
  .extend({
    created_at: z.string(),
    updated_at: z.string()
  })

export type NextOfKinInterface = z.infer<typeof NextOfKinSchema>;

export const UpdateNextOfKinSchema = CreateNextOfKinSchema.partial();

export type UpdateNextOfKinInterface = z.infer<typeof UpdateNextOfKinSchema>;

// SECURITY ANSWER SCHEMAS

export const createSecurityAnswerSchema = z.object({
  user_id: z.number(),
  question_id: z.number(),
  answer: z.string()
});

export type CreateSecurityAnswerInterface = z.infer<typeof createSecurityAnswerSchema>;

export const SecurityAnswerSchema = createSecurityAnswerSchema.extend({
  id: z.number(),
  created_at: z.date()
})

export type SecurityAnswerInterface = z.infer<typeof SecurityAnswerSchema>;

// GROUPS SCHEMA

export const CreateGroupSchema = z.object({
  id: z.number(),
  group_name: z.string(),
  description: z.string(), 
  created_by:z.number(),
});
export type CreateGroupInterface = z.infer<typeof CreateGroupSchema>;

export const CreateGroupResponse = CreateGroupSchema.extend({
  created_at:z.date(),
  updated_at:z.date()
}) 
export type CreateGroupResponseInterface = z.infer<typeof CreateGroupResponse>;

export const ExitGroupSchema = z.object({
  user_id: z.number(),
  group_id: z.number()
})
export type ExitGroupInterface = z.infer<typeof ExitGroupSchema>;

export const UpdateGroupSchema = ExitGroupSchema.pick({
  group_id: true,
}).extend({
  group_name: z.string().optional(),
  description: z.string().optional()
})
export type UpdateGroupInterface = z.infer<typeof UpdateGroupSchema>;

export const UpdateGroupResponseSchema = CreateGroupSchema.pick({
  group_name: true,
  description: true
})
export type UpdateGroupResponseInterface = z.infer<typeof UpdateGroupResponseSchema>;

export const GetGroupMembers = z.object({
  user_id: z.number(),
  full_name: z.string(),
  joined_at: z.date()
})
export type GetGroupMembersInterface = z.infer<typeof GetGroupMembers>;

//INVITE SCHEMA

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

// SAVING SCHEMAS

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
