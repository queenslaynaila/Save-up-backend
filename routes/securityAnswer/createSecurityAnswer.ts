import { Router } from 'express';
import { createSecurityAnswerSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';
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
    const securityQuery = `
          INSERT INTO security_answers (question_id, user_id, answer, created_at, updated_at) 
          VALUES ($1, $2, $3, NOW(), NOW())`;
    const securityValues = [question_id, user_id, hashedAnswer];
    const answerResult = await pool.query(securityQuery, securityValues);
    if (answerResult.rowCount === 0) {
      throw new HttpError(500, 'Failed to create security answer');
    }
    res.json({ message: 'Security answer created successfully' });
  });
};
