import express from 'express';
import createExpense from './createExpense';
import deleteExpense from './deleteExpense';
import getExpensesById from './getExpenseById' ;
import getExpensesByCriteria from './getExpensesByCriteria';
import updateExpense from './updateExpense';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  createExpense(router);
  deleteExpense(router);
  getExpensesById(router);
  getExpensesByCriteria(router);
  updateExpense(router);

  baseRouter.use('/expenses', router);
};