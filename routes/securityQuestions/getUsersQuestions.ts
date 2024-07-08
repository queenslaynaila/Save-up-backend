import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { SecurityQuestions } from './types';
import { AnswerByUserType } from '../securityAnswer/types';

const SQL_GET_USER_SECURITY_QUESTIONS = sql<AnswerByUserType, SecurityQuestions>(`
  SELECT security_questions.id, security_questions.question 
  FROM security_questions
  LEFT JOIN security_answers 
  ON security_questions.id = security_answers.question_id
  WHERE security_answers.user_id = :user_id
`);

export default (router: Router) => {
  router.get<Record<string,never>, SecurityQuestions[], Record<string,never>, 
  Record<string,never>>(
    '/me/', 
    authMiddleware(),
    async (req, res) => {
      const securityQuestions = await SQL_GET_USER_SECURITY_QUESTIONS({
        user_id:req.user!.id
      }).many();
      return res.json(securityQuestions);
    });
};