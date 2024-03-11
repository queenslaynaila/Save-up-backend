import { Router } from 'express';
import { sql } from '../../db';
import { SecurityQuestionSchema } from '../../types';

const SQL_GET_SECURITY_QUESTIONS = sql<Record<string, never>, SecurityQuestionSchema>(
  `SELECT id, question FROM security_questions`
);

export default (router: Router) => {
  router.get<Record<string, never>, SecurityQuestionSchema[], Record<string, never>, Record<string, never>>(
    '/', 
    async (_, res) => {
      const securityQuestions = await SQL_GET_SECURITY_QUESTIONS({}).many();
      return res.json(securityQuestions);
    });
};
