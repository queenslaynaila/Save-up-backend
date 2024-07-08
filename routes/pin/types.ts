import { z } from 'zod';

const ActionEnum = z.enum([
  "Reset", "Update", "Unlock"
]);

export const resetPinRequestSchema = z.object({
  pin: z.string(),
})

export type ResetPinInterface = z.infer<typeof resetPinRequestSchema>

export const verifyAnswerSchema = z.object({
  question_id: z.number(),
  answer: z.string(),
})

export type VerifyAnswerInterface = z.infer<typeof verifyAnswerSchema>

export const securityAnswersRequestSchema = z.object({
  message: z.string(),
  user_id: z.number(),
  answers: z.array(verifyAnswerSchema),
});

export type SecurityAnswersRequestInterface = z.infer<typeof securityAnswersRequestSchema>
  
export const tokenSchema = z.object({
  token: z.string(),
})

export type TokenInterface = z.infer<typeof tokenSchema>

export const verifyTokenSchema = securityAnswersRequestSchema.pick({
  user_id:true
}).extend({
  reset_token: z.string(),
  reason: ActionEnum
})

export type VerifyTokenInterface = z.infer<typeof verifyTokenSchema>

export const updatePasswordSchema = z.object({ 
  old_pin: z.string(),
  new_pin: z.string(),
})

export type UpdatePasswordInterface = z.infer<typeof updatePasswordSchema>

export const securityQuestionSchema = z.object({
  question_id: z.number(),
  question: z.string(),
})

export type SecurityQuestionInterface = z.infer<typeof securityQuestionSchema>

export const securityQuestionArray = z.array(securityQuestionSchema)

export type SecurityQuestionArray = z.infer<typeof securityQuestionArray>

export const updateTokenUsage = verifyTokenSchema.pick({
  reset_token: true
}).extend({
  user_id:z.number(),
  reason: ActionEnum
})

export type UpdateTokenUsageInterface = z.infer<typeof updateTokenUsage>

export const resetPasswordSchema = z.object({
  id: z.number(),  
  new_pin: z.string()
})

export type ResetPasswordInterface = z.infer<typeof resetPasswordSchema>

export const resetPasswordRequest = z.object({
  pin: z.string(),
  id: z.number()
})

export type ResetPasswordRequestInterface = z.infer<typeof resetPasswordRequest>

export const initiatePasswordResetSchema = verifyTokenSchema.pick({
  user_id: true
}).extend({
  token: z.string(),
  reason: ActionEnum
})

export type InitiatePasswordResetInterface = z.infer<typeof initiatePasswordResetSchema>

export const PhoneReasonSchema = z.object({
  phone_number: z.string(),
  reason: ActionEnum
});

export type PhoneReason = z.infer<typeof PhoneReasonSchema>;