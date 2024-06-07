import { Router } from 'express';
import { sql } from '../../db';
import { SecurityQuestionInterface } from '../securityQuestions/types';
import { AnswerByUserType } from './types';

const SQL_GET_USER_SECURITY_QUESTIONS = sql<AnswerByUserType, SecurityQuestionInterface>(`
  SELECT security_questions.id, security_questions.question 
  FROM security_questions
  LEFT JOIN security_answers 
  ON security_questions.id = security_answers.question_id
  AND security_answers.user_id = :user_id
`);

export default (router: Router) => {
  router.get<Record<string,never>, SecurityQuestionInterface[], Record<string,never>, Record<string,never>>(
    '/', 
    async (req, res) => {
      const securityQuestions = await SQL_GET_USER_SECURITY_QUESTIONS({
        user_id:req.user!.id
      }).many();
      return res.json(securityQuestions);
    });
};