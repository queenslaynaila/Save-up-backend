import z from 'zod';

export const securityAnswersBaseSchema = z.object({
  user_id: z.number(),
  question_id: z.number(),
  answer: z.string()
})

export type SecurityAnswersBaseType = z.infer<typeof securityAnswersBaseSchema>;

export const answerCreationValidation = securityAnswersBaseSchema.pick({
  question_id: true,
  answer: true
})

export type AnswerCreationType = z.infer<typeof answerCreationValidation>;

export const answerByUserSchema = securityAnswersBaseSchema.pick({
  user_id: true
})

export type AnswerByUserType = z.infer<typeof answerByUserSchema>;

export const AnswerUpdateSchema = securityAnswersBaseSchema.extend({
  new_question_id:z.string().optional()
})

export type AnswerUpdateType = z.infer<typeof AnswerUpdateSchema>;

export const answerbodySchema = AnswerUpdateSchema.omit({ 
  user_id: true,
  question_id: true
})

export type AnswerBodyType = z.infer<typeof answerbodySchema>;

export const answerTokenSchema =  AnswerUpdateSchema.pick({
  user_id: true
}).extend({
  token: z.string()
})

export type AnswerTokenType = z.infer<typeof answerTokenSchema>;

export const answerUpdateValidationSchema = AnswerUpdateSchema.pick({
  answer: true,
}).extend({
  new_question_id:z.string().optional()
})