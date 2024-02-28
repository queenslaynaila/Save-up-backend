import { Router } from 'express';
import { sql } from '../../db';
import { SecurityQuestionSchema } from '../../types';

const SQL_GET_EXPENSES = sql<Record<string, never>, SecurityQuestionSchema>(
  `SELECT * FROM security_questions`
);

export default (router: Router) => {
  router.get('/', async (_, res) => {
    const securityQuestions = await SQL_GET_EXPENSES({}).many();
    return res.json(securityQuestions);
  });
};
