import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema, updateExpenseSchema } from '../../types';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.patch(
    '/:id',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const validationResultId = idSchema.safeParse(req.params.id);
      if (!validationResultId.success) {
        return res.status(400).json({ error: new HttpError(400, 'Invalid saving ID').message });
      }
      const id = validationResultId.data;
      const userId = req.user?.id;

      const validationResult = updateExpenseSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(403, 'Invalid data');
      }

      const { description, category, amount, date } = validationResult.data;

      const query =
        'UPDATE expenses SET description = $1, category = $2, amount = $3, date = $4 WHERE id = $5 AND user_id = $6 RETURNING *';
      const values = [description, category, amount, date, id, userId];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new HttpError(404, 'Expense not found');
      }
      return res.json(result.rows[0]);
    }
  );
};
