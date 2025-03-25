import { z } from 'zod';

const RELATIONSHIP_ENUM = z.enum([
  'Parent',
  'Spouse',
  'Sibling',
  'Child',
  'Relative',
  'Lawyer',
  'Friend'
]);

export const nextOfKinSchema = z.object({
  user_id: z.number().int(),
  xid: z.number().int(),
  full_name: z.string(),
  relationship: RELATIONSHIP_ENUM,
  phone_number: z.string().regex(/^\+\d{1,4}\d{9}$/),
  created_at: z.string(),
  deleted_at: z.string().optional()
});

export type NextOfKin = z.infer<typeof nextOfKinSchema>;