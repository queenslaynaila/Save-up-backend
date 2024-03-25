import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { ID_SCHEMA} from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_DELETE_SAVING = sql<{ id: number; user_id:number }, Record<string, never>>(`
  UPDATE savings
  SET deleted_at = NOW()
  WHERE id = :id
  AND user_id = :user_id
`);

export default (router: Router) => {
  router.delete<{ id: string },{message:string}, Record<string, never>, Record<string, never>>(
    '/:id', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = ID_SCHEMA.safeParse(parseInt(req.params.id));
      if (!validationResult.success) {
        throw new HttpError(422, 'Unprocessable Entity');
      }
      const id = validationResult.data;
      const userId = req.user!.id;

      await SQL_DELETE_SAVING({ id, user_id: userId }).exec();
      return res.json({ message: 'Savings deleted successfully' });
    });
};
