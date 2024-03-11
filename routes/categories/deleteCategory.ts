import authMiddleware from '../../middleware/auth';
import { Router, Request, Response } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

interface CategorySchema {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

const SQL_DELETE_CATEGORY = sql<Pick<CategorySchema, 'id' | 'user_id'>, Pick<CategorySchema, 'id'>>(`
   UPDATE categories
   SET deleted_at = NOW()
   WHERE id = :id AND user_id = :user_id
   RETURNING id
`);

export default (router: Router) => {
  router.delete<{ id: string }, { message: string }, Record<string, never>, Record<string, never>>(
    '/:id',
    authMiddleware(),
    async (req: Request, res: Response) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid category ID');
      }
      const id = validationResult.data;
      const userId = req.user!.id;
      const idDeleted = await SQL_DELETE_CATEGORY({ id, user_id: userId }).oneOrNull();
      if (!idDeleted) {
        throw new HttpError(404, 'Categories not found');
      }
      return res.json({ message: 'Categories deleted successfully' });
    }
  );
};
