import { Router } from 'express';
import bcrypt from 'bcrypt'; 
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { validateRequest } from '../../middleware/validationMiddleware';
import { SecurityAnswerValidationSchema ,UpdateSecurityAnswerInterface } from '../../types'; 


const SQL_UPDATE_SECURITY_ANSWER = sql<{ question_id: number; user_id: number; answer: string }, Record<string, never>>(`
  UPDATE security_answers 
  SET answer = :answer 
  WHERE question_id = :question_id AND user_id = :user_id
`);

export default (router: Router) => {
  router.patch<{ id: string }, { message: string }, UpdateSecurityAnswerInterface, Record<string, never>>(
    '/:id',
    authMiddleware(),
    validateRequest(SecurityAnswerValidationSchema),
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
