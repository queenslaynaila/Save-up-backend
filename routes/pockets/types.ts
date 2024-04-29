import { z } from 'zod';

export const enum priority {
  HIGH = 'High',
  INTERMEDIATE = 'Intermediate',
  LOW = 'Low',
}
  
export enum pocketType {
  STANDARD = 'Standard Pockets',
  LOCKED = 'Locked Pockets',
}
  
export const baseGoalSchema = z.object({
  entity_id: z.number(),
  category_id: z.number(),
  name: z.string(),  
  target_amount: z.number(),
  priority: z.enum([priority.HIGH, priority.INTERMEDIATE, priority.LOW]),
  target_at: z.string(),
  pocket_type: z.enum([pocketType.STANDARD, pocketType.LOCKED])
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
  pocket_type:z.string()
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

export const goalParamSchema = z.object({
  pocketsIdentifier: z.string() 
})

export type GoalParam = z.infer<typeof goalParamSchema>;

export const deleteGoalSchema = z.object({
  id:z.number(),
  entity_id:z.number()
})

export type DeleteGoal = z.infer<typeof deleteGoalSchema>;
