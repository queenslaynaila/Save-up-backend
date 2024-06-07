import { Router } from 'express';
import bcrypt from 'bcrypt'; 
import { sql } from '../../db';

import { verifyResetToken } from '../../middleware/resetTokenMIddleware'
import { validateRequest } from '../../middleware/validationMiddleware';
import { securityAnswerValidationSchema } from './types'
import { StatusCodeInterface, IdParamInterface } from '../../globalTypes/index'; 

const SQL_UPDATE_SECURITY_ANSWER = sql< { new_question?: number; answer: string , question_id: number, user_id: number}, Record<string,never>>(`
  UPDATE security_answers 
  SET 
    question_id = COALESCE(:new_question, question_id),
    answer = :answer,
  WHERE user_id = :user_id 
  AND question_id = :question_id
`);

export default (router: Router) => {
  router.patch<IdParamInterface, StatusCodeInterface, { new_question?: number; answer: string }, Record<string,never>>(
    '/:id',
    verifyResetToken,
    validateRequest(securityAnswerValidationSchema),
    async (req, res) => {
      const answer = await bcrypt.hash(req.body.answer, 12); 
      await SQL_UPDATE_SECURITY_ANSWER({
        ...req.body,
        answer,
        user_id: req.user!.id,
        question_id: parseInt(req.params.id),
      }).exec();
      res.sendStatus(201);
    }
  );
};
