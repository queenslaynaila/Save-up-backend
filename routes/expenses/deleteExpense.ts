import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';

const SQL_DELETE_EXPENSE = sql<{ id: number; entity_id: number }, Record<string,never>>(`
  UPDATE expenses
  SET deleted_at = NOW()
  WHERE id = :id
  AND entity_id = :entity_id
`);

export default (router: Router) => {
  router.patch<{ id: string }, { message: string }, Record<string,never>, Record<string,never>>(
    '/records/:id', 
    authMiddleware(), 
    async (req, res) => {
      const expenseId = parseInt(req.params.id);
      const userId = req.user!.id;
      await SQL_DELETE_EXPENSE({ id: expenseId, entity_id: userId }).exec();
      return res.json({ message: 'Expenses deleted successfully' });
    });
};
