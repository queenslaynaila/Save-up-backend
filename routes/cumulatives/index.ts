import express from 'express';
import getTotalUserTargetSavings from './getTotalUserTargetSavings';
import getTotalUserContributions from './getTotalUserContributions';
import getTotalUserExpenses from './getTotalUserExpenses';
import getTopExpenseCategories from './getTopExpenseCategories';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  getTotalUserTargetSavings(router);
  getTotalUserContributions(router);
  getTotalUserExpenses(router);
  getTopExpenseCategories(router);

  baseRouter.use('/cumulatives', router);
};
