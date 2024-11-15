import { z } from 'zod';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import Router from '../../router';
import { SecurityQuestions, securityQuestions } from './getAllSecurityQuestions';

const SQL_GET_USER_SECURITY_QUESTIONS = sql<{user_id:number}, SecurityQuestions>(`
  SELECT 
    security_questions.id, 
    security_questions.question 
  FROM security_questions
  LEFT JOIN security_answers 
  ON security_questions.id = security_answers.question_id
  WHERE security_answers.user_id = :user_id
`);

const getUserSecurityQuestions = (router: Router) => {
  router.route({
    method: 'get',
    path: '/me/',
    summary: 'Get user security questions',
    response: {
      schema: z.array(securityQuestions)
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const questions = await SQL_GET_USER_SECURITY_QUESTIONS({
        user_id: req.user!.id
      }).many();
      return res.json(questions);
    }
  });
};

export default getUserSecurityQuestions;