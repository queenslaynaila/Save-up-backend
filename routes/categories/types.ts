import { z } from 'zod';

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