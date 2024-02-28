import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_DELETE_CATEGORY = sql<{ id: string; user_id: string }, Record<string, never>>(`
  DELETE FROM categories WHERE id = :categoryId AND user_id = :userId RETURNING id
`);

export default (router: Router) => {
  router.delete('/:id', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid category ID');
    }
    const categoryId = validationResult.data;
    const userId = req.user!.id;
    const idDeleted = await SQL_DELETE_CATEGORY({ id: categoryId, user_id: userId }).oneOrNull();
    if (!idDeleted) {
      throw new HttpError(404, 'Category not found');
    }
    return res.json({ message: 'Category deleted successfully' });
  });
};
