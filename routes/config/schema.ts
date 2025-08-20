import z from "zod";

export const configSchema = z.object({
    id: z.number(),
    country_code: z.string(),
    country_name: z.string(),
    currency: z.string(),
    calling_code: z.string(),
    languages: z.array(z.string()),
    min_deposit: z.number(),
    max_deposit: z.number(),
    min_withdrawal: z.number(),
    max_withdrawal: z.number(),
    withdrawal_charges: z.string(),
    created_at: z.string()
})

export type Config = z.infer<typeof configSchema>;