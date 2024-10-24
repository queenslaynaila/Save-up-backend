import { z } from 'zod';

export const externalSavingSchema = z.object({
  entity_id: z.number(),
  pocket_id: z.number(),
  donor_id: z.number(),
  amount: z.number(),
  show_details: z.boolean()
});

export type ExternalSavingInterface = z.infer<typeof externalSavingSchema>