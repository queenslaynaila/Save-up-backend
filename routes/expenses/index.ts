import express from 'express';
import createExpense from './createExpense';
//import deleteExpense from './deleteExpense';
//import getExpensesByConditions from './getExpensesByConditions';
//import updateExpense from './updateExpense';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createExpense(router);
  //deleteExpense(router);
  //getExpensesByConditions(router);
  //updateExpense(router);

  baseRouter.use('/expenses', router);
};
