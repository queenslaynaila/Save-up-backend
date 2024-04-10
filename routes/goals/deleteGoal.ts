import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { ID_SCHEMA} from '../../types';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_DELETE_GOAL = sql<{ id: number; entity_id:number }, Record<string, never>>(`
  UPDATE goals
  SET deleted_at = NOW()
  WHERE id = :id
  AND entity_id = :entity_id
`);

export default (router: Router) => {
  router.patch<{ id: string },{message:string}, Record<string, never>, Record<string, never>>(
    'record/:id', 
    authMiddleware(), 
    validateRequest(ID_SCHEMA),
    async (req, res) => {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      await SQL_DELETE_GOAL({ id, entity_id: userId }).exec();
      return res.json({ message: 'Goal deleted successfully' });
    });
};
