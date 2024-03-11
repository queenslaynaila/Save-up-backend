import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_DELETE_EXPENSE = sql<{ id: string; user_id: string }, Record<string, never>>(`
  DELETE FROM expenses WHERE id = :id AND user_id = :user_id RETURNING id
`);

export default (router: Router) => {
  router.delete<{ id: string },{ message: string }, Record<string, never>, Record<string, never>>(
    '/:id', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(403, 'Invalid expense ID');
      }
      const id = validationResult.data;
      const userId = req.user!.id;
      const idDeleted = await SQL_DELETE_EXPENSE({ id, user_id: userId }).oneOrNull();
      if (!idDeleted) {
        throw new HttpError(404, 'Expense not found');
      }
      return res.json({ message: 'Expenses deleted successfully' });
    });
};
