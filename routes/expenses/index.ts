import express from 'express';
import createExpense from './createExpense';
import deleteExpense from './deleteExpense';
import getAllExpenses from './getAllExpenses';
import getExpenseById from './getExpenseById';
import getExpensesByUserId from './getExpensesByUserId';
import updateExpense from './updateExpense';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createExpense(router);
  deleteExpense(router);
  getAllExpenses(router);
  getExpenseById(router);
  getExpensesByUserId(router);
  updateExpense(router);

  baseRouter.use('/expenses', router);
};
