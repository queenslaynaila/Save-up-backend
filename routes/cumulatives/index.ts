import express from 'express';
import getTotalUserTargetSavings from './getTotalUserTargetSavings';
import getTotalUserContributions from './getTotalUserContributions';
import getTotalUserExpenses from './getTotalUserExpenses';
import getTotalSavingsByCustomTimeFrame from './getTotalSavingsByCustomTimeFrame';
import getTotalContributionsByTime from './getTotalContributionsByTime';
import getExpenseByCustomTimeeframe from './getExpenseByCustomTimeeframe';
import getExpenseComparisonByCategory from './getExpenseComparisonByCategory';
export default (baseRouter: express.Router) => {
  const router = express.Router();
  getTotalUserTargetSavings(router);
  getTotalUserContributions(router);
  getTotalUserExpenses(router);
  getExpenseByCustomTimeeframe(router);
  getTotalSavingsByCustomTimeFrame(router);
  getTotalContributionsByTime(router);
  getExpenseComparisonByCategory(router);

  baseRouter.use('/cumulatives', router);
};
