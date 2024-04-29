import { z } from 'zod';

export const resetPinSchema = z.object({
  pin: z.string(),
})

export type ResetPinInterface = z.infer<typeof resetPinSchema>

export const verifyAnswerSchema = z.object({
  questionId: z.number(),
  answer: z.string(),
})

export type VerifyAnswerInterface = z.infer<typeof verifyAnswerSchema>

export const securityAnswersRequestSchema = z.object({
  message: z.string(),
  userId: z.number(),
  answers: z.array(verifyAnswerSchema),
});

export type SecurityAnswersRequestInterface = z.infer<typeof securityAnswersRequestSchema>
  
export const tokenSchema = z.object({
  token: z.string(),
})

export type TokenInterface = z.infer<typeof tokenSchema>

export const verifyTokenSchema = securityAnswersRequestSchema.pick({
  userId:true
}).extend({
  resetToken: z.string()
})

export type VerifyTokenInterface = z.infer<typeof verifyTokenSchema>

export const updatePasswordSchema = z.object({ 
  oldPassword: z.string(),
  newPassword: z.string(),
})

export type UpdatePasswordInterface = z.infer<typeof updatePasswordSchema>

export const securityQuestionSchema = z.object({
  questionId: z.number(),
  question: z.string(),
})

export type SecurityQuestionInterface = z.infer<typeof securityQuestionSchema>

export const securityQuestionArray = z.array(securityQuestionSchema)

export type SecurityQuestionArray = z.infer<typeof securityQuestionArray>

export const updateTokenUsage = verifyTokenSchema.pick({
  resetToken: true
}).extend({
  userId:z.number()
})

export type UpdateTokenUsageInterface = z.infer<typeof updateTokenUsage>

export const resetPasswordSchema = z.object({
  id: z.number(),  
  newPassword: z.string()
})

export type ResetPasswordInterface = z.infer<typeof resetPasswordSchema>

export const resetPasswordRequest = z.object({
  pin: z.string(),
  id: z.number()
})

export type ResetPasswordRequestInterface = z.infer<typeof resetPasswordRequest>

export const initiatePasswordResetSchema = verifyTokenSchema.pick({
  userId: true
}).extend({
  token: z.string()
})

export type InitiatePasswordResetInterface = z.infer<typeof initiatePasswordResetSchema>