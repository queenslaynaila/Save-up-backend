import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.delete(
    '/',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);

      if (!validationResult.success) {
        throw new HttpError(403, 'Invalid expense ID');
      }
      const id = validationResult.data;
      const userId = req.user?.id;
      const query = 'DELETE FROM expenses WHERE id = $1 AND user_id = $2';
      const result = await pool.query(query, [id, userId]);
      if (result.rowCount != null && result.rowCount > 0) {
        return res.status(204).json({ message: 'Expense deleted successfully' });
      } else {
        throw new HttpError(400, 'Expense with provided ID not found');
      }
    }
  );
};
