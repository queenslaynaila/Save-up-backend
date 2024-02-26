import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

export default (router: Router) => {
  router.delete('/:id', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid category ID');
    }
    const categoryId = validationResult.data;
    const userId = req.user!.id;
    const query = 'DELETE FROM categories WHERE id = :categoryId AND user_id = :userId';
    const SQL_DELETE_SAVING = sql<{ id: string; user_id: string }, Record<string, never>>(query);
    await SQL_DELETE_SAVING({id:categoryId, user_id: userId }).exec();
    return res.json({ message: 'Category deleted successfully' });
  });
};
