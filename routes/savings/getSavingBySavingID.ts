import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { hasPermission } from '../../middleware/hasPermission';
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
      const userId = req.user!.id;
      const logged_in_user_role = req.user!.role;
      if (!hasPermission(req, userId, logged_in_user_role)) {
        throw new HttpError(403, 'Unauthorized access');
      }

      const query = 'SELECT * FROM savings WHERE id = $1 AND user_id = $2';
      const result = await pool.query(query, [id, userId]);

      if (!result || result.rows.length === 0) {
        throw new HttpError(400, 'Saving not found');
      }

      res.json(result.rows[0]);
    }
  );
};
