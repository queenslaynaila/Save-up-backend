import z from 'zod'

export const securityQuestionSchema = z.object({
  id: z.number(),
  question: z.string()
})
    
export type SecurityQuestionInterface = z.infer<typeof securityQuestionSchema>;