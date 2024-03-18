import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema, updateExpenseSchema, ExtendedExpenseInterface } from '../../types';
import authMiddleware from '../../middleware/auth';
import { sql } from '../../db';

const SQL_UPDATE_EXPENSE= sql<z.infer<typeof updateExpenseSchema> & { id: string;user_id:string;},ExtendedExpenseInterface>(`
  UPDATE expenses
  SET description = coalesce(:description,  expenses.description)
      category_id = coalesce(:category_id,  expenses.category_id)
      amount = coalesce(:amount,  expenses.amount)
      expense_date = coalesce(:date,  expenses.expense_date )
  WHERE user_id = :user_id AND id = :expense_id
  RETURNING *
`);

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const userId = req.user!.id;
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid expense ID');
    }
    const expenseId = validationResult.data;

    const validationResultBody = updateExpenseSchema.safeParse(req.body);
    if (!validationResultBody.success) {
      throw new HttpError(422, validationResultBody.error.errors[0].message);
    }

    const { description, category_id, amount,expense_date } = validationResultBody.data;

    const result = await SQL_UPDATE_EXPENSE({
      user_id: userId,
      id: expenseId,
      description: description ,
      category_id: category_id ,
      amount: amount ,
      expense_date:expense_date ,
    }).one(new HttpError(400, 'Expense with given ID not found'));
    res.json(result);
  });
};
