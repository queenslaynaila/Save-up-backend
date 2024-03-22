import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserRole, ID_SCHEMA,ExtendedExpenseInterface } from '../../types';
import { sql } from '../../db';

const SQL_GET_EXPENSE_BY_ID = sql<{ id:number; userId?:number }, ExtendedExpenseInterface>(`
  SELECT * FROM savings WHERE id = :id
`);

export default (router: Router) => {
  router.get<{ id: string }, ExtendedExpenseInterface, Record<string, never>, Record<string, never>>(
    '/records/:expenseId', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = ID_SCHEMA.safeParse(parseInt(req.params.id));
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid expense ID');
      }

      const expenseId = validationResult.data;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const query = SQL_GET_EXPENSE_BY_ID({ id: expenseId });
      if (userRole !== UserRole.ADMIN) {
        query.extend('AND user_id = :userId', { userId });
      }
      const result = await query.one(new HttpError(404, 'Expense not found'));
      return res.json(result);
    });
};
