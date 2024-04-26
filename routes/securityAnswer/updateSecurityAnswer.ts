import { Router } from 'express';
import bcrypt from 'bcrypt'; 
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { securityAnswerValidationSchema, UpdateSecurityAnswerInterface,  CreateSecurityAnswerInterface } from './types'
import { MessageInterface, IdParamInterface } from '../../globalTypes/index'; 

const SQL_UPDATE_SECURITY_ANSWER = sql< CreateSecurityAnswerInterface, Record<string,never>>(`
  UPDATE security_answers 
    SET answer = :answer 
    WHERE question_id = :question_id 
    AND user_id = :user_id 
`);

export default (router: Router) => {
  router.patch<IdParamInterface, MessageInterface, UpdateSecurityAnswerInterface, Record<string,never>>(
    '/:id',
    authMiddleware(),
    validateRequest(securityAnswerValidationSchema),
    async (req, res) => {
      const securityQuestionId = parseInt(req.params.id); 
      const loggedInUserId = req.user!.id; 
      const answer = await bcrypt.hash(req.body.answer, 12); 
      console.log(req.body)
      await SQL_UPDATE_SECURITY_ANSWER({
        question_id: securityQuestionId,
        user_id: loggedInUserId,
        answer: answer,
      }).exec();
      return res.json({ message: 'Answer updated successfully' });
    }
  );
};
