import { z } from 'zod';
//mport { entityTypeSchema } from '../groups/types';

export const basePocketSchema = z.object({
  entity_id: z.number(),
  category_id: z.number(),
  name: z.string(),  
  priority: z.enum(['High', 'Intermediate', 'Low']),
  target_amount: z.number(),
  target_at: z.string(),
  pocket_type: z.enum(['Standard', 'Locked'])
});

export const pocketSchema =  basePocketSchema.extend({
  xid: z.number(),
  status:z.string(),
  created_at : z.date(),
  updated_at: z.date(),
  completed_at: z.date()
})
  
export type PocketInterface = z.infer<typeof pocketSchema>;

export const updatePocketSchema = basePocketSchema.partial().extend({
  xid: z.number()
});

export type UpdatePocketInterface = z.infer<typeof updatePocketSchema>;






export const getPocketSchema = basePocketSchema.pick({
  entity_id:true
}).partial()

export type getPocketInterface = z.infer< typeof getPocketSchema>

export const createPocketSchema = basePocketSchema.extend({
  entity_id: z.number().optional(),
}); 
  
export type CreatePocketInterface = z.infer<typeof basePocketSchema>;
  

  


  
export const pocketUpdateResSchema = z.object({
  name: z.string(),
  category_name: z.number().positive(), 
  target_amount: z.number().positive(), 
  priority: z.enum(['Low', 'Intermediate', 'High']), 
  target_at: z.date(),
});
  
export type PocketUpdateRes = z.infer<typeof pocketUpdateResSchema >;
  
export const UpgradePocketSubsetSchema = z.object({
  target_at: z.date().optional(),
  id: z.number(),
  pocket_type: z.string()
});

export type UpgradePocketSubset = z.infer<typeof UpgradePocketSubsetSchema>;
  
export const upgradePocketSchema = UpgradePocketSubsetSchema.pick({target_at:true})
  
export type UpgradePocketInterface = z.infer<typeof upgradePocketSchema>;
  
export const pocketsByConditionsQuerySchema = z.object({
  is_default: z.string().optional(),
  category_id: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
})
  
export type PocketsConditionsQueryInterface = z.infer<typeof pocketsByConditionsQuerySchema>;

export const pocketParamSchema = z.object({
  pockets_identifier: z.string() 
});

export type PocketParam = z.infer<typeof pocketParamSchema>;

export const deletePocketSchema = z.object({
  pocket_id: z.number(),
  entity_id: z.number()
});

export type DeletePocket = z.infer<typeof deletePocketSchema>;

export const upgradedPocketSChema = z.object({
  pocket_type : z.string(),
  interest_rate: z.number(),
  target_at: z.date().optional()
})

export type upgradedPocketInterface = z.infer<typeof updatePocketSchema>