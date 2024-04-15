import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';

const SQL_DELETE_KIN = sql<{ user_id: number, id: number },Record<string, never>>(`
    UPDATE next_of_kins  
    SET deleted_at = NOW()
    WHERE user_id = :user_id
    AND id = :id
`);

export default (router: Router) => {   
  router.patch<{ id: string },{message:string}, Record<string, never>, Record<string, never>>(
    '/record/:id', 
    authMiddleware(), 
    async (req, res) => {
      const user_id = req.user!.id;
      const id = parseInt(req.params.id);
      await SQL_DELETE_KIN({user_id, id }).exec();
      return res.json({ message: 'Kin deleted successfully' });
    }
  );
};
