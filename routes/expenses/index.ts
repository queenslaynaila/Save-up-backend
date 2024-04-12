import express from 'express';
import createExpense from './createExpense';
import deleteExpense from './deleteExpense';
import getExpensesById from './getExpenseById' ;
import getExpensesByConditions from './getExpensesByConditions';
import updateExpense from './updateExpense';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createExpense(router);
  deleteExpense(router);
  getExpensesById(router);
  getExpensesByConditions(router);
  updateExpense(router);

  baseRouter.use('/expenses', router);
};