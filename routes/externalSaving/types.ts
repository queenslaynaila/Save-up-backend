import { z } from 'zod';

export const externalSavingSchema = z.object({
  entity_id: z.number().min(1),
  pocket_id: z.number().min(1),
  donor_id: z.number(),
  amount: z.number(),
  show_details: z.boolean()
});

export type ExternalSavingInterface = z.infer<typeof externalSavingSchema>