import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { UpdateExpenseInterface ,ExpenseInterface  ,UpdateExpenseSchema } from '../../types';
import authMiddleware from '../../middleware/auth';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';


const SQL_UPDATE_EXPENSE= sql<UpdateExpenseInterface,ExpenseInterface>(`
  UPDATE expenses
  SET description = COALESCE(:description, expenses.description),
      category_id = COALESCE(:category_id, expenses.category_id),
      amount_spent = COALESCE(:amount, expenses.amount),
      date_spent = COALESCE(:date_spent , expenses.date_spent )
  WHERE entity_id = :entity_id AND id = :id
  RETURNING entity_id,id,category_id,description,amount_spent,date_spent
`);

export default (router: Router) => {
  router.patch('/:id', 
    authMiddleware(), 
    validateRequest(UpdateExpenseSchema),
    async (req, res) => {
      const userId = req.user!.id;
      const expenseId = parseInt(req.params.id);
      const { description, category_id, amount,expense_date } = req.body;
      const result = await SQL_UPDATE_EXPENSE({
        entity_id: userId,
        id: expenseId,
        description: description ,
        category_id: category_id ,
        amount_spent: amount ,
        date_spent:expense_date ,
      }).one(new HttpError(404, 'Not found'));
      res.json(result);
    });
};
