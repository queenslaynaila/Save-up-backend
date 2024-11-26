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
  user_id: z.number(),
  xid: z.number(),
  full_name: z.string(),
  relationship: RELATIONSHIP_ENUM,
  phone_number: z.string(),
  created_at: z.string(),
  deleted_at: z.string().optional()
});