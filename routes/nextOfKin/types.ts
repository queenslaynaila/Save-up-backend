import { z } from 'zod';

export const createNextOfKinSchema = z.object({
  userId:z.number(),
  fullName: z.string(),
  relationship: z.enum(['Parent', 'Spouse', 'Sibling', 'Child', 'Relative', 'Lawyer', 'Friend']),
  email: z.string().email(),
  phoneNumber: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
});
  
export type CreateNextOfKinInterface = z.infer<typeof createNextOfKinSchema>;
  
export const NextOfKinSchema= createNextOfKinSchema
  .omit({ userId: true })
  .extend({
    id: z.number(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  
export type NextOfKinInterface = z.infer<typeof NextOfKinSchema>;
  
export const updateNextOfKinSchema = createNextOfKinSchema.partial().extend({
  id: z.number()
});
  
export type UpdateNextOfKinInterface = z.infer<typeof updateNextOfKinSchema>;

export const nextOfKinCreationSchema = createNextOfKinSchema.omit({userId: true});

export const deleteNextOfKinSchema = NextOfKinSchema
  .pick({id: true}).
  extend({userId: z.number()})

export type DeleteNextOfKinInterface = z.infer<typeof deleteNextOfKinSchema>;

export const getNextOfKinSchema = createNextOfKinSchema.pick({
  userId: true
})

export type GetNextOfKinInterface = z.infer<typeof getNextOfKinSchema>;