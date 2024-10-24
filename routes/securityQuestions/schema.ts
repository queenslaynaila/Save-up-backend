import z from 'zod';

export const baseSecurityQuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  created_at: z.string()
});

export type SecurityQuestions = z.infer<typeof baseSecurityQuestionSchema>;