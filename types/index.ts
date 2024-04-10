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
    id: z.number(),
    created_at: z.string(),
    updated_at: z.string()
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

export type UpdateGoalInterface = z.infer<typeof UpdateGoalSchema>;

// SAVING SCHEMAS

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

// EXPENSES SCHEMAS

export const BaseExpenseSchema = z.object({
  entity_id: z.number(),
  category_id: z.number(),
  description: z.string(),
  amount_spent: z.number(),
  date_spent: z.date(),
});

export type CreateExpenseInterface = z.infer<typeof BaseExpenseSchema>;

export const ExpenseSchema = BaseExpenseSchema.extend({
  id: z.number(),
  created_at: z.date()
})

export type ExpenseInterface = z.infer<typeof ExpenseSchema>;

export const UpdateExpenseSchema = BaseExpenseSchema.partial().extend({id: z.number()});

export type UpdateExpenseInterface = z.infer<typeof UpdateExpenseSchema>;
