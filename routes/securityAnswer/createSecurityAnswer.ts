import { Router } from 'express';
import { createSecurityAnswerSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.post('/', async (req, res) => {
    const validationResult = createSecurityAnswerSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid data');
    }
    const { question_id, user_id, answer } = validationResult.data;
    const securityQuery = `
          INSERT INTO security_answers (question_id, user_id, answer, created_at, updated_at) 
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING *`;
    const securityValues = [question_id, user_id, answer];
    const answerResult = await pool.query(securityQuery, securityValues);
    if (answerResult.rows.length === 0) {
      throw new HttpError(500, 'Failed to create security answer');
    }
    const newAnswer = answerResult.rows[0];
    res.json(newAnswer);
  });
};
