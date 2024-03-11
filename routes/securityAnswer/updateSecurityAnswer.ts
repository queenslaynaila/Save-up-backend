import { Router } from 'express';
import { updateSecurityAnswerSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_UPDATE_SECURITY_ANSWER = sql<{ question_id: string; answer: string; user_id: string },Record<string, never>>(`
  UPDATE security_answers 
  SET answer = :answer, updated_at = NOW() 
  WHERE question_id = :question_id AND user_id = :user_id
  RETURNING *
`);

export default (router: Router) => {
  router.patch('/', authMiddleware(), async (req, res) => {
    const validationResult = updateSecurityAnswerSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid data');
    }
    const { question_id, answer } = validationResult.data;
    const userId = req.user!.id;
    const updateResult = await SQL_UPDATE_SECURITY_ANSWER({
      question_id,
      answer,
      user_id: userId,
    }).one();
    res.json(updateResult);
  });
};
