import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';
import authMiddleware from '../../middleware/auth'; 
export default (router: Router) => {
  router.delete('/:id',authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid ID');
    }
    const securityAnswerId = validationResult.data;

    const deleteQuery = `
      DELETE FROM security_answers 
      WHERE id = $1
      RETURNING *`;
    const deleteValues = [securityAnswerId];

    const deleteResult = await pool.query(deleteQuery, deleteValues);
    if (deleteResult.rows.length === 0) {
      throw new HttpError(404, 'Security answer not found');
    }
    res.json({ message: 'Security answer deleted successfully' });
  });
};
