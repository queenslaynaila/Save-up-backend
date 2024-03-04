import express from 'express';
import createExpense from './createExpense';
import deleteExpense from './deleteExpense';
import getAllExpenses from './getAllExpenses';
import updateExpense from './updateExpense';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createExpense(router);
  deleteExpense(router);
  getAllExpenses(router);
  updateExpense(router);

  baseRouter.use('/expenses', router);
};
