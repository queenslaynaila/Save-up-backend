import Router from '../../router';
import { z } from 'zod';
import { sql } from '../../db';

const securityQuestionSchema = z.object({
  id: z.number().min(1),
  question: z.string(),
  created_at: z.string()
});

const securityQuestions = securityQuestionSchema.pick({
  id: true,
  question: true
});
type SecurityQuestions = z.infer<typeof securityQuestions>;

const SQL_GET_SECURITY_QUESTIONS = sql<Record<string, never>, SecurityQuestions>(`
  SELECT id, question FROM security_questions
`);

const getAllSecurityQuestions = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of system defined security questions',
    response: {
        schema: z.array(securityQuestions)
    },
    handler: async (req, res) => {
      const questions = await SQL_GET_SECURITY_QUESTIONS({}).many();
      return res.json(questions);
    }
  });
};

export default getAllSecurityQuestions;