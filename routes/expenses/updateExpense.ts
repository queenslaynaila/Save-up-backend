import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { updateExpenseSchema, ExtendedExpenseInterface } from '../../types';
import authMiddleware from '../../middleware/auth';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';


const SQL_UPDATE_EXPENSE= sql<z.infer<typeof updateExpenseSchema> & { id:number;user_id:number;},ExtendedExpenseInterface>(`
  UPDATE expenses
  SET description = COALESCE(:description, expenses.description),
      category_id = COALESCE(:category_id, expenses.category_id),
      amount = COALESCE(:amount, expenses.amount),
      expense_date = COALESCE(:expense_spent_at, expenses.expense_spent_at)
  WHERE user_id = :user_id AND id = :id
  RETURNING *
`);

export default (router: Router) => {
  router.patch('/:id', 
    authMiddleware(), 
    validateRequest(updateExpenseSchema),
    async (req, res) => {
      const userId = req.user!.id;
      const expenseId = parseInt(req.params.id);

      const validationResultBody = updateExpenseSchema.safeParse(req.body);
      if (!validationResultBody.success) {
        throw new HttpError(422, "Unprocessable Entity");
      }

      const { description, category_id, amount,expense_date } = validationResultBody.data;

      const result = await SQL_UPDATE_EXPENSE({
        user_id: userId,
        id: expenseId,
        description: description ,
        category_id: category_id ,
        amount: amount ,
        expense_date:expense_date ,
      }).one(new HttpError(404, 'Not found'));
      res.json(result);
    });
};
