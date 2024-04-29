import z from 'zod';

export const securityQuestionSchema = z.object({
  id: z.number(),
  question: z.string()
})
  
export type SecurityQuestionInterface = z.infer<typeof securityQuestionSchema>;
  
export const updateSecurityAnswerSchema = securityQuestionSchema.extend({
  answer: z.string()
})
  
export type UpdateSecurityAnswerInterface = z.infer<typeof updateSecurityAnswerSchema>;
  
export const securityAnswerValidationSchema = updateSecurityAnswerSchema.pick({
  answer: true
})

export const createSecurityAnswerSchema = z.object({
  userId: z.number(),
  questionId: z.number(),
  answer: z.string()
});
  
export type CreateSecurityAnswerInterface = z.infer<typeof createSecurityAnswerSchema>;
  
export const securityAnswerRequestSchema = createSecurityAnswerSchema.omit({ userId: true});
  
export const securityAnswerSchema = createSecurityAnswerSchema.extend({
  id: z.number(),
  createdAt: z.date()
})
  
export type SecurityAnswerInterface = z.infer<typeof securityAnswerSchema>;

export const checkAnswerSchema = z.object({
  hasSecurityAnswer: z.boolean()
})

export type CheckAnswerInterface = z.infer<typeof checkAnswerSchema>;
  