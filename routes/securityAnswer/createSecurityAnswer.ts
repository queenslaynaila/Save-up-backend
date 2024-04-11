import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateSecurityAnswerInterface , createSecurityAnswerSchema } from '../../types';

const SQL_CREATE_ANSWER = sql<CreateSecurityAnswerInterface ,Record<string, never>>(`
  INSERT INTO security_answers ( user_id, question_id, answer) 
  VALUES (:user_id, :question_id, :answer)
`); 

export default (router: Router) => {
  router.post<Record<string, never>, { message: string }, CreateSecurityAnswerInterface , Record<string, never>>(
    '/', 
    authMiddleware(), 
    validateRequest(createSecurityAnswerSchema),
    async (req, res) => {
      const validationResult = createSecurityAnswerSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(422, 'Unprocessable Entity');
      }
      const { user_id, question_id , answer } = req.body;
      const hashedAnswer = await bcrypt.hash(answer, 12);
      await SQL_CREATE_ANSWER({ user_id,  question_id, answer: hashedAnswer }).exec();
      res.json({ message: 'Security answer created successfully' });
    });
};
