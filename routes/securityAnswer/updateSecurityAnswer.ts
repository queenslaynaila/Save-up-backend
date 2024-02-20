import { Router } from 'express';
import { updateSecurityAnswerSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.patch('/', async (req, res) => {
    const validationResult = updateSecurityAnswerSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid data');
    }
    const { question_id, answer } = validationResult.data;

    const updateQuery = `
      UPDATE security_answers 
      SET answer = $1, updated_at = NOW() 
      WHERE question_id = $2 AND user_id = $3
      RETURNING *`;
    const updateValues = [answer, question_id];

    const updateResult = await pool.query(updateQuery, updateValues);
    if (updateResult.rows.length === 0) {
      throw new HttpError(404, 'Security answer not found');
    }
    const updatedAnswer = updateResult.rows[0];
    res.json(updatedAnswer);
  });
};
