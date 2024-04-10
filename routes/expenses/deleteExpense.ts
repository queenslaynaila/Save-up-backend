import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { ID_SCHEMA} from '../../types';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_DELETE_EXPENSE = sql<{ id: number; user_id: number }, Record<string, never>>(`
  UPDATE expenses
  SET deleted_at = NOW()
  WHERE id = :id
  AND user_id = :user_id
`);

export default (router: Router) => {
  router.patch<{ id: string },{ message: string }, Record<string, never>, Record<string, never>>(
    'records/:id', 
    authMiddleware(), 
    validateRequest(ID_SCHEMA),
    async (req, res) => {
      const expenseId = parseInt(req.params.id);
      const userId = req.user!.id;
      await SQL_DELETE_EXPENSE({ id: expenseId, user_id: userId }).exec();
      return res.json({ message: 'Expenses deleted successfully' });
    });
};
