import { z } from 'zod';

export const externalSavingSchema = z.object({
  pocket_id: z.number().int(),
  amount: z.number(), 
  show_donor_details:z.boolean(),
  full_name: z.string(),
  phone_number:z.string()
})

export type ExternalSavingInterface = z.infer<typeof externalSavingSchema>