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

//MESSAGE RESPONSESCHEMA

export const messageSchema = z.object({
  message: z.string()
})

export type MessageInterface = z.infer<typeof messageSchema>;

// CATEGORY SCHEMAS
export const createCategorySchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type CreateCategoryInterface = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.number(),
})

export type UpdatedCategoryInterface = z.infer<typeof updateCategorySchema>;

export const categorySchema = updateCategorySchema.required().extend({
  created_at: z.date()
});

export const categoriesArraySchema = z.array(categorySchema)

export type CategoriesArrayInterface = z.infer<typeof categoriesArraySchema>;

export type CategoryInterface = z.infer<typeof categorySchema>;

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

// NEXT OF KIN SCHEMAS
export const createNextOfKinSchema = z.object({
  user_id:z.number(),
  full_name: z.string(),
  relationship: z.enum(['Parent', 'Spouse', 'Sibling', 'Child', 'Relative', 'Lawyer', 'Friend']),
  email: z.string().email(),
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
});

export type CreateNextOfKinInterface = z.infer<typeof createNextOfKinSchema>;

export const NextOfKinSchema= createNextOfKinSchema
  .omit({ user_id: true })
  .extend({
    id: z.number(),
    created_at: z.date(),
    updated_at: z.date()
  })

export type NextOfKinInterface = z.infer<typeof NextOfKinSchema>;

export const updateNextOfKinSchema = createNextOfKinSchema.partial().extend({
  id: z.number()
});

export type UpdateNextOfKinInterface = z.infer<typeof updateNextOfKinSchema>;

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

export const baseGroupSchema = z.object({
  group_name: z.string(),
  description: z.string(), 
})

export const createGroupSchema = baseGroupSchema.extend({
  id: z.number(),
  created_by:z.number()
})

export type CreateGroupInterface = z.infer<typeof createGroupSchema>;

export const commonGroupSchema = createGroupSchema.omit({ created_by: true })

export type CommonGroupInterface = z.infer<typeof commonGroupSchema>;

export const createGroupResponse = createGroupSchema.extend({
  created_at:z.date(),
  updated_at:z.date()
}) 
export type CreateGroupResponseInterface = z.infer<typeof createGroupResponse>;

export const exitGroupSchema = z.object({
  user_id: z.number(),
  group_id: z.number()
})
export type ExitGroupInterface = z.infer<typeof exitGroupSchema>;

export const updateGroupSchema = exitGroupSchema.pick({
  group_id: true,
}).extend({
  group_name: z.string().optional(),
  description: z.string().optional()
})
export type UpdateGroupInterface = z.infer<typeof updateGroupSchema>;

export const updateGroupResponseSchema = createGroupSchema.pick({
  group_name: true,
  description: true
})
export type UpdateGroupResponseInterface = z.infer<typeof updateGroupResponseSchema>;

export const getGroupMembers = z.object({
  user_id: z.number(),
  full_name: z.string(),
  joined_at: z.date()
})

export type GetGroupMembersInterface = z.infer<typeof getGroupMembers>;

export const nominatedAdminSchema = exitGroupSchema.extend({
  full_name: z.string(),
  nominated_at: z.date()
})

export type NominatedAdminInterface = z.infer<typeof nominatedAdminSchema>;

//INVITE SCHEMA

export const sendInviteSchema = z.object({
  receiver_id:z.number(),
  sender_id:z.number(),
  group_id:z.number(),
});

export const getInviteSchema = sendInviteSchema.extend({
  created_at:z.date(),
})

export type InviteInterface = z.infer<typeof getInviteSchema>;

export type SendInviteInterface = z.infer<typeof sendInviteSchema>;

export const inviteSchema = z.object({
  group_id:z.number(),
  sender_id:z.number(),
  receiver_id:z.number(),
});

export const inviteResponseSchema = inviteSchema.extend({
  status:z.string()
}).omit({sender_id: true});


export type InviteResponseInterface = z.infer<typeof inviteResponseSchema>;

export const inviteRequestSchema = inviteResponseSchema.omit({sender_id: true, receiver_id: true});

export type InviteRequestInterface = z.infer<typeof inviteRequestSchema>;

// GOAL SCHEMAS

export const idSchema = z.number();
export const ID_SCHEMA = z.number();

export const enum priority {
  HIGH = 'High',
  INTERMEDIATE = 'Intermediate',
  LOW = 'Low',
}

export enum goalType {
  STANDARD = 'Standard Goals',
  LOCKED = 'Locked Goals',
}

export const baseGoalSchema = z.object({
  entity_id: z.number(),
  category_id: z.number(),
  name: z.string(),  
  target_amount: z.number(),
  priority: z.enum([priority.HIGH, priority.INTERMEDIATE, priority.LOW]),
  target_at: z.string(),
  goal_type: z.enum([goalType.STANDARD, goalType.LOCKED])
});

export type CreateGoalInterface = z.infer<typeof baseGoalSchema>;

export const goalSchema =  baseGoalSchema.extend({
  id: z.number(),
  created_at: z.date(),
  target_at: z.date(),
  updated_at: z.date(),
  completed_at: z.date(),
  interest_rate:z.number().min(0).max(100)
})

export type GoalInterface = z.infer<typeof goalSchema>;

export const updateGoalSchema = baseGoalSchema.omit({ entity_id: true }).partial().extend({id: z.number()});

export const UpdateGoalRequestSchema = updateGoalSchema.omit({ id: true });

export type UpdateGoalInterface = z.infer<typeof updateGoalSchema>;

export const goalUpdateResSchema = z.object({
  name: z.string(),
  category_id: z.number().positive(), 
  target_amount: z.number().positive(), 
  priority: z.enum(['Low', 'Medium', 'High']), 
  target_at: z.date(),
});

export type GoalUpdateRes = z.infer<typeof goalUpdateResSchema >;

const UpgradeGoalSubsetSchema = z.object({
  target_at: z.date().optional(),
  id: z.number(),
  goal_type:z.string()
});

export type UpgradeGoalSubset = z.infer<typeof UpgradeGoalSubsetSchema>;

export const upgradeGoalSchema = UpgradeGoalSubsetSchema.pick({target_at:true})

export type UpgradeGoalInterface = z.infer<typeof upgradeGoalSchema>;

export const goalsByConditionsQuerySchema = z.object({
  category_id: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  start_at: z.string().optional(),
  completed_at: z.string().optional(),
});

export type GoalsConditionsQueryInterface = z.infer<typeof goalsByConditionsQuerySchema>;


// SAVING SCHEMAS

export const BaseSavingSchema = z.object({
  user_id: z.number(),
  goal_id: z.number(),
  amount: z.number(),
});

export type CreateSavingInterface = z.infer<typeof BaseSavingSchema>;

export const validateSavingCreationSchema = BaseSavingSchema.omit({ user_id: true })

export const SavingSchema = BaseSavingSchema.extend({
  id: z.number(),
  created_at: z.date(),
})

export type SavingInterface = z.infer<typeof SavingSchema>;

// EXPENSES SCHEMAS

export const baseExpenseSchema = z.object({
  entity_id: z.number(),
  category_id: z.number(),
  description: z.string(),
  amount_spent: z.number(),
  date_spent: z.string(),
});

export const deleteExpenseSchema = baseExpenseSchema.pick({entity_id: true})

export type DeleteExpenseInterface = z.infer<typeof deleteExpenseSchema>;

export const createExpenseSchemaValidation = baseExpenseSchema.partial()

export type CreateExpenseInterface = z.infer<typeof baseExpenseSchema>;

export const expenseSchema = baseExpenseSchema.extend({
  id: z.number(),
  created_at: z.date()
})

export type ExpenseInterface = z.infer<typeof expenseSchema>;

export const updateExpenseSchema = baseExpenseSchema.partial().extend({id: z.number()});

export type UpdateExpenseInterface = z.infer<typeof updateExpenseSchema>;

export const validateUpdateExpenseSchema = updateExpenseSchema.omit({
  entity_id:true,
  id:true
})

export const expenseIdSchema = z.object({
  expenseId: z.string(),
});

export type ExpenseIdInterface = z.infer<typeof expenseIdSchema>;

export const expenseByIdSchema = z.object({
  id: z.number(),
  entity_id: z.number(),
});

export type ExpenseByIdInterface = z.infer<typeof expenseByIdSchema>;

export const expenseIdentifierSchema = z.object({
  expenseIdentifier: z.string(),
});

export type ExpenseIdentifierInterface = z.infer<typeof expenseIdentifierSchema>;

export const expenseQuerySchema = z.object({
  category_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type ExpenseQueryInterface = z.infer<typeof expenseQuerySchema>;

//SECURITY QUESTION SCHEMA
export const securityQuestionsSchema =  z.object({
  question_id: z.number().positive(),
  question: z.string(),
});

export type SecurityQuestions = z.infer<typeof securityQuestionsSchema>;

//ADMIN SCHEMA
export const ValidOperatorsEnum = z.enum(['SUM', 'MAX', 'MIN', 'AVG', 'COUNT']);
export const ValidResourcesEnum = z.enum(['goals', 'savings', 'expenses']);
export const ValidStatusEnum = z.enum(['Completed', 'Dormant', 'In Progress']);

export const statsQuerySchema = z.object({
  user_id: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  category_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type StatsQueryInterface = z.infer<typeof statsQuerySchema>;

export const statsParamSchema = z.object({
  resource: z.string(),
  operator: z.string(),
});

export type StatsParamInterface = z.infer<typeof statsParamSchema>;

export const financialStatsSchema = z.object({
  totals: z.number()
})

export type FinancialStatsInterface = z.infer<typeof financialStatsSchema>;

export const userRoleUpdateSchema = z.object({
  roleToUpdate: z.string(),
  id: z.string(),
});

export type UserRoleUpdateInterface = z.infer<typeof userRoleUpdateSchema>;

export type RoleUpdateResultInterface = z.infer<typeof updatedUserRoleSchema>;

//GROUP ADMIN SCHEMA

export const nominateParamsSchema = z.object({
  group_id: z.string(),
  nominated_member_id: z.string(),
});

export type NominateParamsInterface = z.infer<typeof nominateParamsSchema>;

export const voteSChema = z.object({
  vote:z.boolean()
})

export type VoteInterface = z.infer<typeof voteSChema>;

////////////////////////////////////////////////////////////////////////////////
export const nextOfKinCreationSchema = createNextOfKinSchema.omit({user_id: true});

export const getTopExpenseCategoriesSchema = z.array(
  z.object({
    category_id:z.number(),
    total_expense:z.number()
  })
)

export type TopExpenseCategoriesInterface = z.infer<typeof getTopExpenseCategoriesSchema>;

export const getTotalExpensesQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional()
});

export const getTotalExpenseResultSchema = z.object({
  total_expenses: z.number()
})

export const getTotalSavingsResultSchema = z.object({
  total_savings: z.number()
})

export const getTotalTargetsSchema = z.object({
  total_target_amount: z.number()
})

export const totalTargetGoalsQuerySchema = z.object({
  priority: z.string().optional(),
  status: z.string().optional(),
  category_id: z.string().optional()
});
