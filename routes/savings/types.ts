import { z } from 'zod';

export const baseSavingSchema = z.object({
  entity_id: z.number(),
  xid: z.number(),
  pocket_id: z.number(),
  user_id: z.number(),
  amount: z.number(),
  created_at: z.string(),
});

export type BaseSavingType = z.infer<typeof baseSavingSchema>;

export const savingSchema = baseSavingSchema.omit({
  entity_id: true,
  xid: true
});

export type SavingType = z.infer<typeof savingSchema>;

export const userSavingSchema = baseSavingSchema.pick({
  entity_id: true
}).extend({
  type_id: z.number()
})

export type UserSavingType = z.infer<typeof userSavingSchema>;

export const savingCreateSchema = baseSavingSchema.pick({
  user_id: true,
  pocket_id: true,
  amount: true
});

export type SavingCreateType = z.infer<typeof savingCreateSchema>;

export const savingPostRequestSchema =  baseSavingSchema.pick({
  amount: true
}).extend({
  pocket_id: z.number()
});

export type SavingPostRequestType = z.infer<typeof savingPostRequestSchema>; 

export const savingsQueryParamSchema = z.object({
  pocket_id:z.string(),
  start_date: z.string(),
  end_date: z.string()
}).partial();

export type SavingsQueryParamType = z.infer<typeof savingsQueryParamSchema>;

export const totalSavings = z.object({
  total_savings: z.number()
});

export type Totals = z.infer<typeof totalSavings>;

export const totalSavingsSchema = z.object({
  type_id: z.number(),
  entity_id: z.number()
})

export type TotalsInterface = z.infer<typeof totalSavingsSchema>;

export const totalsBody = totalSavingsSchema.pick({
  entity_id: true
}).partial();

export type TotalsBody = z.infer<typeof totalsBody>;

export type TotalSavings = z.infer<typeof totalSavings>;

export const availableSavings = z.object({
  delta: z.number()
});

export type Balance = z.infer<typeof availableSavings>;

export const queryParams = z.object({
  start_date: z.string(),
  end_date: z.string()
}).partial();

export type QueryParams = z.infer<typeof queryParams>;