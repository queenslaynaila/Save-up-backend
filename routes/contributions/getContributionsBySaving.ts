import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/saving/:id',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.saving_id);

      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid saving ID');
      }
      const saving_id = validationResult.data;

      const query = 'SELECT * FROM contributions WHERE saving_id = $1';
      const result = await pool.query(query, [saving_id]);
      if (result.rows.length === 0) {
        throw new HttpError(404, 'Contribution with given savingID not found');
      }
      return res.json(result.rows);
    }
  );
};
