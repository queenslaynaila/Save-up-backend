import { Router } from 'express';
import { sql } from '../../db';
import { SecurityQuestionSchema } from '../../types';

export default (router: Router) => {
  router.get('/', async (_, res) => {
    const query = `SELECT * FROM security_questions  `;
    const SQL_GET_EXPENSES = sql<Record<string, never>, SecurityQuestionSchema>(query);
    const securityQuestions = await SQL_GET_EXPENSES({}).many();
    return res.json(securityQuestions)
  });
};
