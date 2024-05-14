import { z } from 'zod';

export const externalSavingSchema = z.object({
  pocket_id: z.number().int(),
  amount: z.number(), 
  show_donor_details:z.boolean()
})

export type ExternalSavingInterface = z.infer<typeof externalSavingSchema>