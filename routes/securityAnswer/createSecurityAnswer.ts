import { Router } from 'express';
import { createSecurityAnswerSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import bcrypt from 'bcrypt';
import authMiddleware from '../../middleware/auth';

export default (router: Router) => {
  router.post('/', authMiddleware(), async (req, res) => {
    const validationResult = createSecurityAnswerSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid data');
    }

    const { question_id, user_id, answer } = validationResult.data;
    const hashedAnswer = await bcrypt.hash(answer, 10);

    const query = `
      INSERT INTO security_answers (question_id, user_id, answer, created_at, updated_at) 
      VALUES (:question_id, :user_id, :answer, NOW(), NOW())
    `;
    
    const SQL_CREATE_ANSWER = sql<{question_id: string; user_id: string; answer: string}, Record<string, never>>(query);

    await SQL_CREATE_ANSWER({ question_id, user_id, answer: hashedAnswer }).exec();

    res.json({ message: 'Security answer created successfully' });
  });
};
