import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

export default (router: Router) => {
  router.delete('/:id', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid saving ID');
    }
    
    const id = validationResult.data;
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const query = `DELETE FROM savings WHERE id = :id AND user_id = :user_id`;
    const SQL_DELETE_SAVING = sql<{ id: string; user_id: string }, Record<string, never>>(query);

    await SQL_DELETE_SAVING({ id, user_id: userId }).exec();

    return res.json({ message: 'Savings deleted successfully' });
  });
};
