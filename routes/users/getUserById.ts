import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { idSchema } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/:id',
    authMiddleware(),
    //validate(),
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid user data');
      }

      const authenticatedUserId = req.user?.id;
      const id = validationResult.data;
      if (authenticatedUserId !== id) {
        throw new HttpError(404, 'Resource Not found');
      }

      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new HttpError(404, 'User not found');
      }
      const user = result.rows[0];

      res.json(user);
    }
  );
};
