import { z } from 'zod';

// CATEGORY SCHEMAS
export const CreateCategorySchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type CreateCategoryInterface = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  id: z.number(),
})

export type UpdatedCategoryInterface = z.infer<typeof UpdateCategorySchema>;

export const CategorySchema = UpdateCategorySchema.extend({
  created_at: z.date()
})

export type CategoryInterface = z.infer<typeof CategorySchema>;

// SECURITY QUESTIONS & ANSWERS SCHEMA

export const SecurityQuestionSchema = z.object({
  id: z.number(),
  question: z.string()
})

export type SecurityQuestionInterface = z.infer<typeof SecurityQuestionSchema>;

export const UpdateSecurityAnswerSchema = SecurityQuestionSchema.extend({
  answer: z.string()
})

export type UpdateSecurityAnswerInterface = z.infer<typeof UpdateSecurityAnswerSchema>;

export const SecurityAnswerValidationSchema = UpdateSecurityAnswerSchema.pick({
  answer: true
})

// USER  SCHEMA
export const enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
  MODERATOR = 'Moderator'
}

export const BaseUserSchema = z.object({
  full_name: z.string(),
  gender: z.enum(['Male', 'Female', 'Prefer not to say']),
  national_id: z.number().int().min(10000000).max(99999999),                
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
  pin: z.string().refine((value) => /^\d{4}$/.test(value)),
});

export type UserInterface = z.infer<typeof BaseUserSchema>;

export const UserWithRoleSchema = BaseUserSchema.extend({
  role: z.enum(['Admin']).optional(),
})

export type UserWithRoleInterface = z.infer< typeof UserWithRoleSchema>

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

export const CreateAdminSchema = BaseUserSchema.omit({
  phone_number: true,
  national_id: true
}).extend({
  id: z.number(),
  role: z.enum(['Admin'])
});

export type CreateAdminInterface = z.infer<typeof CreateAdminSchema>;

export const UpdatedUserRoleSchema = CreateAdminSchema.omit({
  pin: true
})

export type UpdatedUserRoleInterface = z.infer<typeof UpdatedUserRoleSchema>;

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
  relationship: z.enum(['Parent', 'Spouse', 'Sibling', 'Child', 'Relative', 'Lawyer', 'Friend']),
  email: z.string().email(),
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
});

export type CreateNextOfKinInterface = z.infer<typeof CreateNextOfKinSchema>;

export const NextOfKinSchema= CreateNextOfKinSchema
  .omit({ user_id: true })
  .extend({
    id: z.number(),
    created_at: z.date(),
    updated_at: z.date()
  })

export type NextOfKinInterface = z.infer<typeof NextOfKinSchema>;

export const UpdateNextOfKinSchema = CreateNextOfKinSchema.partial().extend({
  id: z.number()
});

export type UpdateNextOfKinInterface = z.infer<typeof UpdateNextOfKinSchema>;

// SECURITY ANSWER SCHEMAS

export const createSecurityAnswerSchema = z.object({
  user_id: z.number(),
  question_id: z.number(),
  answer: z.string()
});

export type CreateSecurityAnswerInterface = z.infer<typeof createSecurityAnswerSchema>;

export const SecurityAnswerRequestSchema = createSecurityAnswerSchema.omit({ user_id: true});

export const SecurityAnswerSchema = createSecurityAnswerSchema.extend({
  id: z.number(),
  created_at: z.date()
})

export type SecurityAnswerInterface = z.infer<typeof SecurityAnswerSchema>;

// GROUPS SCHEMA

export const BaseGroupSchema = z.object({
  group_name: z.string(),
  description: z.string(), 
})

export const CreateGroupSchema = BaseGroupSchema.extend({
  id: z.number(),
  created_by:z.number()
})

export type CreateGroupInterface = z.infer<typeof CreateGroupSchema>;

export const CommonGroupSchema = CreateGroupSchema.omit({ created_by: true })

export type CommonGroupInterface = z.infer<typeof CommonGroupSchema>;

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

export const NominatedAdminSchema = ExitGroupSchema.extend({
  full_name: z.string(),
  nominated_at: z.date()
})

export type NominatedAdminInterface = z.infer<typeof NominatedAdminSchema>;

//INVITE SCHEMA

export const SendInviteSchema = z.object({
  receiver_id:z.number(),
  sender_id:z.number(),
  group_id:z.number(),
});

export const GetInviteSchema = SendInviteSchema.extend({
  created_at:z.date(),
})

export type InviteInterface = z.infer<typeof GetInviteSchema>;

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

export const InviteRequestSchema = InviteResponseSchema.omit({sender_id: true, receiver_id: true});

export type InviteRequestInterface = z.infer<typeof InviteRequestSchema>;

// GOAL SCHEMAS

export const ID_SCHEMA = z.number();

export const enum priority {
  HIGH = 'High',
  INTERMEDIATE = 'Intermediate',
  LOW = 'Low',
}

export const BaseGoalSchema = z.object({
  entity_id: z.number(),
  category_id: z.number(),
  description: z.string(),  
  amount: z.number(),
  priority: z.enum([priority.HIGH, priority.INTERMEDIATE, priority.LOW]),
  target_at: z.string(),
});


export type CreateGoalInterface = z.infer<typeof BaseGoalSchema>;

export const GoalSchema =  BaseGoalSchema.extend({
  id: z.number(),
  created_at: z.date(),
  target_at: z.date(),
  updated_at: z.date(),
  completed_at: z.date(),
})

export type GoalInterface = z.infer<typeof GoalSchema>;

export const UpdateGoalSchema = BaseGoalSchema.omit({ entity_id: true }).partial().extend({id: z.number()});

export const UpdateGoalRequestSchema = UpdateGoalSchema.omit({ id: true });

export type UpdateGoalInterface = z.infer<typeof UpdateGoalSchema>;

// SAVING SCHEMAS

export const BaseSavingSchema = z.object({
  user_id: z.number(),
  goal_id: z.number(),
  amount: z.number(),
});

export type CreateSavingInterface = z.infer<typeof BaseSavingSchema>;

export const ValidateSavingCreation = BaseSavingSchema.omit({ user_id: true })

export const SavingSchema = BaseSavingSchema.extend({
  id: z.number(),
  created_at: z.date(),
})

export type SavingInterface = z.infer<typeof SavingSchema>;

// EXPENSES SCHEMAS

export const BaseExpenseSchema = z.object({
  entity_id: z.number(),
  category_id: z.number(),
  description: z.string(),
  amount_spent: z.number(),
  date_spent: z.string(),
});

export const CreateExpenseSchemaValidation = BaseExpenseSchema.omit({ entity_id: true }).partial()

export type CreateExpenseInterface = z.infer<typeof BaseExpenseSchema>;

export const ExpenseSchema = BaseExpenseSchema.extend({
  id: z.number(),
  created_at: z.date()
})

export type ExpenseInterface = z.infer<typeof ExpenseSchema>;

export const UpdateExpenseSchema = BaseExpenseSchema.partial().extend({id: z.number()});

export type UpdateExpenseInterface = z.infer<typeof UpdateExpenseSchema>;

export const ValidateUpdateExpenseSchema = UpdateExpenseSchema.omit({
  entity_id:true,
  id:true
})
