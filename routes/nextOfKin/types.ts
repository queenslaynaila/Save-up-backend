import { z } from 'zod';

export const nextOfKinCreationSchema = z.object({
  user_id:z.number(),
  full_name: z.string(),
  relationship: z.enum(['Parent', 'Spouse', 'Sibling', 'Child', 'Relative', 'Lawyer', 'Friend']),
  phone_number: z
    .string()
    .refine((value) => /^\+254\d{9}$/.test(value)),
});

export const nextOfKinValidation = nextOfKinCreationSchema.omit({ user_id: true })

export type NextOfKinValidation = z.infer<typeof nextOfKinValidation>;
  
export type NextOfKinCreationInterface = z.infer<typeof nextOfKinCreationSchema>;
  
export const NextOfKinSchema= nextOfKinCreationSchema
  .omit({ user_id: true })
  .extend({
    xid: z.number(),
    created_at: z.date(),
    updated_at: z.date()
  })
  
export type NextOfKinInterface = z.infer<typeof NextOfKinSchema>;
  
export const nextOfKinUpdateSchema = nextOfKinCreationSchema.partial().extend({
  id: z.number()
});
  
export type NextOfKinUpdateInterface = z.infer<typeof nextOfKinUpdateSchema>;

export const nextOfKinCreationScheman = nextOfKinCreationSchema.omit({ user_id: true });

export const nextOfKinDeletionSchema = NextOfKinSchema
  .pick({xid: true}).
  extend({user_id: z.number()})

export type NextOfKinDeletionInterface = z.infer<typeof nextOfKinDeletionSchema>;

export const nextOfKinInputSchema= nextOfKinCreationSchema.pick({
  user_id: true
})

export type NextOfKinInputInterface = z.infer<typeof nextOfKinInputSchema>;