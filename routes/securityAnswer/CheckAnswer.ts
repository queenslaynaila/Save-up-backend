import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { securityAnswerValidationSchema, CheckAnswerInterface } from './types'
import { GetByUserInterface } from '../../globalTypes/index'

const SQL_CHECK_SECURITY_ANSWER = sql<GetByUserInterface, CheckAnswerInterface>(`
    SELECT EXISTS(
        SELECT 1
        FROM security_answers
        WHERE user_id = :user_id
    ) AS has_security_answer;  
`);

export default (router: Router) => {
  router.get<Record<string,never>, CheckAnswerInterface, Record<string,never>, Record<string,never>>(
    '/check-answer',
    authMiddleware(),
    validateRequest(securityAnswerValidationSchema),
    async (req, res) => {
      const loggedInUserId = req.user!.id; 
      const checkAnswer = await SQL_CHECK_SECURITY_ANSWER({user_id: loggedInUserId}).one();
      return res.json(checkAnswer);
    }
  );
};
