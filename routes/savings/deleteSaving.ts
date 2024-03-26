import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { ID_SCHEMA} from '../../types';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';

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
    validateRequest(ID_SCHEMA),
    async (req, res) => {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;

      await SQL_DELETE_SAVING({ id, user_id: userId }).exec();
      return res.json({ message: 'Savings deleted successfully' });
    });
};
