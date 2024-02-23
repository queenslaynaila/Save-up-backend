import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/:id',
    authMiddleware(),
    //validate(),
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid saving ID');
      }
      const id = validationResult.data;
      const userId = req.user?.id;

      const query = 'SELECT * FROM savings WHERE id = $1 AND user_id = $2';
      const result = await pool.query(query, [id, userId]);

      if (!result || result.rows.length === 0) {
        throw new HttpError(400, 'Saving not found');
      }

      res.json(result.rows[0]);
    }
  );
};
