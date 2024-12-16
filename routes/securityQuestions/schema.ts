import z from 'zod';

export const securityQuestionSchema = z.object({
  id: z.number().min(1),
  question: z.string(),
  created_at: z.string()
});
