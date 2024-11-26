import { z } from 'zod';

export const securityAnswerSchema = z.object({
  user_id: z.number().int(),
  question_id: z.number().int(),
  answer: z.string(),
  created_at: z.string()
});

export type SecurityAnswer = z.infer<typeof securityAnswerSchema>;