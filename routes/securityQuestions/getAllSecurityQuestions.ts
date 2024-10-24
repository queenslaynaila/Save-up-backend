import { Router } from 'express';
import { sql } from '../../db';
import { SecurityQuestions } from './types';

const SQL_GET_SECURITY_QUESTIONS = sql<Record<string, never>, SecurityQuestions>(`
  SELECT id, question FROM security_questions
`);

export default (router: Router) => {
  router.get<Record<string, never>, SecurityQuestions[], Record<string, never>,
  Record<string, never>>(
    '/',
    async (_, res) => {
      const securityQuestions = await SQL_GET_SECURITY_QUESTIONS({}).many();
      return res.json(securityQuestions);
    }
  );
};