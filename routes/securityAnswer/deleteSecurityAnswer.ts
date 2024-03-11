import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_DELETE_SECURITY_ANSWER = sql<{ id: string; user_id: string }, Record<string, never>>(`
  DELETE FROM security_answers WHERE id = :securityAnswerId AND user_id = :userId RETURNING id
`);

export default (router: Router) => {
  router.delete<{ id: string },{message:string}, Record<string, never>, Record<string, never>>(
    '/:id', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(422, 'Invalid ID');
      }
      const securityAnswerId = validationResult.data;
      const loggedInUserId = req.user!.id;
      const deletedAnswerId = await SQL_DELETE_SECURITY_ANSWER({
        id: securityAnswerId,
        user_id: loggedInUserId,
      }).oneOrNull();
      if (!deletedAnswerId) {
        throw new HttpError(404, 'Answer not found');
      }

      return res.json({ message: 'Answer deleted successfully' });
    });
};
