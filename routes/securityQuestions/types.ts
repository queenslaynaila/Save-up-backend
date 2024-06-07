import z from 'zod'

export const securityQuestionSchema = z.object({
  id: z.number(),
  question: z.string()
})
    
export type SecurityQuestionType = z.infer<typeof securityQuestionSchema>;