import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/:id',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid contributions ID');
      }
      const id = validationResult.data;
      const query = 'SELECT * FROM contributions WHERE id = $1';
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        throw new HttpError(404, 'Contribution with provided ID not found');
      }
      return res.status(200).json(result.rows[0]);
    }
  );
};
