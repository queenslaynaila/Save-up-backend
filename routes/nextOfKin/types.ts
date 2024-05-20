import { z } from 'zod';

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
    xid: z.number(),
    created_at: z.date(),
    updated_at: z.date()
  })
  
export type NextOfKinInterface = z.infer<typeof NextOfKinSchema>;
  
export const updateNextOfKinSchema = createNextOfKinSchema.partial().extend({
  id: z.number()
});
  
export type UpdateNextOfKinInterface = z.infer<typeof updateNextOfKinSchema>;

export const nextOfKinCreationSchema = createNextOfKinSchema.omit({ user_id: true });

export const deleteNextOfKinSchema = NextOfKinSchema
  .pick({xid: true}).
  extend({user_id: z.number()})

export type DeleteNextOfKinInterface = z.infer<typeof deleteNextOfKinSchema>;

export const getNextOfKinSchema = createNextOfKinSchema.pick({
  user_id: true
})

export type GetNextOfKinInterface = z.infer<typeof getNextOfKinSchema>;