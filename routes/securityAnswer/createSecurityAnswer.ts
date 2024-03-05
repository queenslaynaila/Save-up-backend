import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import { createSecurityAnswerSchema } from '../../types';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_CREATE_ANSWER = sql<z.infer<typeof createSecurityAnswerSchema>,Record<string, never>>(`INSERT INTO security_answers (question_id, user_id, answer, created_at, updated_at) 
VALUES (:question_id, :user_id, :answer, NOW(), NOW())`);

export default (router: Router) => {
  router.post('/', authMiddleware(), async (req, res) => {
    const validationResult = createSecurityAnswerSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid data');
    }
    const { question_id, user_id, answer } = validationResult.data;
    const hashedAnswer = await bcrypt.hash(answer, 10);
    await SQL_CREATE_ANSWER({ question_id, user_id, answer: hashedAnswer }).exec();
    res.json({ message: 'Security answer created successfully' });
  });
};
