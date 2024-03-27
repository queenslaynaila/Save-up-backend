import  { FastifyInstance } from 'fastify';
import getTotalUserTargetSavings from './getTotalUserTargetSavings';
import getTotalUserContributions from './getTotalUserContributions';
import getTotalUserExpenses from './getTotalUserExpenses';
import getTopExpenseCategories from './getTopExpenseCategories';

export default (fastify: FastifyInstance) => {

  getTotalUserTargetSavings(fastify);
  getTotalUserContributions(fastify);
  getTotalUserExpenses(fastify);
  getTopExpenseCategories(fastify);

};
