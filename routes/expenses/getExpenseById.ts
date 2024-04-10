import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { ExpenseInterface, ID_SCHEMA } from '../../types';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_GET_EXPENSE_BY_ID = sql<{ id:number; userId?:number },  ExpenseInterface>(`
  SELECT entity_id,id,category_id,description,amount_spent,date_spent
  FROM expenses 
  WHERE id = :id
`);

export default (router: Router) => {
  router.get<{ id: string }, ExpenseInterface, Record<string, never>, Record<string, never>>(
    '/records/:expenseId', 
    authMiddleware(), 
    validateRequest(ID_SCHEMA),
    async (req, res) => {
      const expenseId = parseInt(req.params.id);
      const query = SQL_GET_EXPENSE_BY_ID({ id: expenseId });
      const result = await query.one(new HttpError(404, 'Not found'));
      return res.json(result);
    });
};
