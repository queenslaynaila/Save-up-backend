import z from 'zod';

export const securityQuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  created_at: z.string()
});
