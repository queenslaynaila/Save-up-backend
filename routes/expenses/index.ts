import { FastifyInstance } from 'fastify';
import createExpense from './createExpense';
import deleteExpense from './deleteExpense';
import getExpensesById from './getExpenseById' ;
import getExpensesByConditions from './getExpensesByConditions';
import updateExpense from './updateExpense';

export default (fastify: FastifyInstance) => {

  createExpense(fastify);
  deleteExpense(fastify);
  getExpensesById(fastify);
  getExpensesByConditions(fastify);
  updateExpense(fastify);


};
