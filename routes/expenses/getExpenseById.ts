import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { ExpenseInterface  } from '../../types';

const SQL_GET_EXPENSE_BY_ID = sql<{ id:number; entity_id:number },  ExpenseInterface>(`
  SELECT entity_id, id, category_id, description, amount_spent, date_spent
  FROM expenses 
  WHERE id = :id AND entity_id = :entity_id
`);

export default (router: Router) => {
  router.get<{ expenseId: string }, ExpenseInterface, Record<string, never>, Record<string, never>>(
    '/records/:expenseId', 
    authMiddleware(), 
    async (req, res) => {
      const expenseId = parseInt(req.params.expenseId); 
      const entity_id = req.user!.id;
      const query = SQL_GET_EXPENSE_BY_ID({ id: expenseId, entity_id });
      const result = await query.one(new HttpError(404, 'Not found'));
      return res.json(result);
    });
};

