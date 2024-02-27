import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
export default (router: Router) => {
  router.delete('/:id', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid ID');
    }
    const securityAnswerId = validationResult.data;
    const userId = req.user!.id;
    const query = 'DELETE FROM security_answers  WHERE id = :securityAnswerId AND user_id = :userId RETURNING id';
    const SQL_DELETE_SAVING = sql<{ id: string; user_id: string }, Record<string, never>>(query);
    const idDeleted = await SQL_DELETE_SAVING({id:securityAnswerId, user_id: userId }).oneOrNull();
    if (!idDeleted ) {
      throw new HttpError(404, 'Answer not found');
    }
    return res.json({ message: 'Answer deleted successfully' });
  });
};
