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
  
export const basePocketSchema = z.object({
  entityId: z.number(),
  categoryId: z.number(),
  name: z.string(),  
  targetAmount: z.number(),
  priority: z.enum([priority.HIGH, priority.INTERMEDIATE, priority.LOW]),
  targetAt: z.string(),
  pocketType: z.enum([pocketType.STANDARD, pocketType.LOCKED])
});
  
export type CreatePocketInterface = z.infer<typeof basePocketSchema>;
  
export const pocketSchema =  basePocketSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  targetAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date(),
  interestRate:z.number().min(0).max(100)
})
  
export type PocketInterface = z.infer<typeof pocketSchema>;
  
export const updatePocketSchema = basePocketSchema.omit({ entityId: true }).partial().extend({id: z.number()});
  
export const UpdatePocketRequestSchema = updatePocketSchema.omit({ id: true });
  
export type UpdatePocketInterface = z.infer<typeof updatePocketSchema>;
  
export const pocketUpdateResSchema = z.object({
  name: z.string(),
  categoryId: z.number().positive(), 
  targetAmount: z.number().positive(), 
  priority: z.enum(['Low', 'Medium', 'High']), 
  targetAt: z.date(),
});
  
export type PocketUpdateRes = z.infer<typeof pocketUpdateResSchema >;
  
const UpgradePocketSubsetSchema = z.object({
  targetAt: z.date().optional(),
  id: z.number(),
  pocketType:z.string()
});
  
export type UpgradePocketSubset = z.infer<typeof UpgradePocketSubsetSchema>;
  
export const upgradePocketSchema = UpgradePocketSubsetSchema.pick({targetAt:true})
  
export type UpgradePocketInterface = z.infer<typeof upgradePocketSchema>;
  
export const pocketsByConditionsQuerySchema = z.object({
  categoryId: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  startAt: z.string().optional(),
  completedAt: z.string().optional(),
});
  
export type PocketsConditionsQueryInterface = z.infer<typeof pocketsByConditionsQuerySchema>;

export const pocketParamSchema = z.object({
  pocketsIdentifier: z.string() 
})

export type PocketParam = z.infer<typeof pocketParamSchema>;

export const deletePocketSchema = z.object({
  id:z.number(),
  entityId:z.number()
})

export type DeletePocket = z.infer<typeof deletePocketSchema>;
