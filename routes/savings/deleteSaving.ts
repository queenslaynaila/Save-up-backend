import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_DELETE_SAVING = sql<{ id: string; user_id: string }, Record<string, never>>(`
  DELETE FROM savings WHERE id = :id AND user_id = :user_id RETURNING id
`);

export default (router: Router) => {
  router.delete<{ id: string },{message:string}, Record<string, never>, Record<string, never>>(
    '/:id', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid saving ID');
      }
      const id = validationResult.data;
      const userId = req.user!.id;

      const idDeleted = await SQL_DELETE_SAVING({ id, user_id: userId }).oneOrNull();
      if (!idDeleted) {
        throw new HttpError(404, 'Saving not found');
      }
      return res.json({ message: 'Savings deleted successfully' });
    });
};
