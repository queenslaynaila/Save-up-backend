import { Router } from 'express';
import { z } from 'zod';
import { sql } from '../../db';
import { baseSecurityQuestionSchema } from './schema';

const securityQuestions = baseSecurityQuestionSchema.pick({
  id: true,
  question: true
});
export type SecurityQuestions = z.infer<typeof securityQuestions>;

const SQL_GET_SECURITY_QUESTIONS = sql<Record<string, never>, SecurityQuestions>(`
  SELECT id, question FROM security_questions
`);

export default (router: Router) => {
  router.get<Record<string, never>, SecurityQuestions[], Record<string, never>,
  Record<string, never>>(
    '/',
    async (_, res) => {
      const questions = await SQL_GET_SECURITY_QUESTIONS({}).many();
      return res.json(questions);
    }
  );
};