import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_DELETE_KIN = sql<{ user_id: number },{ message:string }>(`
    DELETE FROM next_of_kin WHERE user_id = :user_id
`);

export default (router: Router) => {   
  router.delete<{ id: string },{message:string}, Record<string, never>, Record<string, never>>(
    '/deletekin', 
    authMiddleware(), 
    async (req, res) => {
      const user_id = req.user!.id;
      await SQL_DELETE_KIN({user_id }).exec();
      return res.json({ message: 'Kin deleted successfully' });
    }
  );
};
