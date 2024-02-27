import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserRole, idSchema,ExtendedExpenseInterface } from '../../types';
import { sql } from '../../db';

let query = 'SELECT * FROM expenses WHERE id = :id';
const SQL_GET_EXPENSE_BY_ID = sql<{ id: string; userId?: string }, ExtendedExpenseInterface>(query);

export default (router: Router) => {
  router.get('/:id', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid expense ID');
    }

    const expenseId = validationResult.data;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const values: { id: string; userId?: string } = { id: expenseId };
    if (userRole !== UserRole.ADMIN) {
      query += ' AND user_id = :userId';
      values.userId = userId;
    }
    const result = await SQL_GET_EXPENSE_BY_ID(values).one(new HttpError(404, 'Expense not found'));
    return res.json(result);
  });
};
