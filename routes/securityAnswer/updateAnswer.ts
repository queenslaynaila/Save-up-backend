import { Router } from 'express';
import bcrypt from 'bcrypt'; 
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { answerUpdateValidationSchema, AnswerUpdateType } from './types'
import { StatusCodeInterface, IdParamInterface } from '../../globalTypes/index'; 

const SQL_UPDATE_SECURITY_ANSWER = sql<AnswerUpdateType, Record<string,never>>(`
  UPDATE security_answers 
  SET 
    question_id = COALESCE(:new_question_id, question_id),
    answer = :answer
  WHERE user_id = :user_id 
  AND question_id = :question_id
`);

export default (router: Router) => {
  router.patch<IdParamInterface, StatusCodeInterface, AnswerUpdateType, 
  Record<string,never>>(
    '/:id',
    authMiddleware(),
    validateRequest(answerUpdateValidationSchema),
    async (req, res) => {
      const answer = await bcrypt.hash(req.body.answer, 12); 
      await SQL_UPDATE_SECURITY_ANSWER({
        ...req.body,
        answer,
        user_id: req.user!.id,
        question_id: parseInt(req.params.id),
        new_question_id: req.body.new_question_id
      }).exec();
      res.sendStatus(204);
    }
  );
};