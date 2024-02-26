import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

export default (router: Router) => {
  router.delete('/', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(403, 'Invalid expense ID');
    }
    const id = validationResult.data;
    const userId = req.user!.id;
    const query = 'DELETE FROM expenses WHERE id = :id AND user_id = :userId';
    const SQL_DELETE_EXPENSE = sql<{ id: string; user_id: string }, Record<string, never>>(query);
    await SQL_DELETE_EXPENSE({ id, user_id: userId }).exec();
    return res.json({ message: 'Expenses deleted successfully' });
  });
};
