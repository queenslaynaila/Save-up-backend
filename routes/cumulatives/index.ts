import express from 'express';
import getTotalUserTargetSavings from './getTotalUserTargetSavings';
import getTotalUserContributions from './getTotalUserContributions';
import getTotalUserExpenses from './getTotalUserExpenses';
export default (baseRouter: express.Router) => {
  const router = express.Router();
  getTotalUserTargetSavings(router);
  getTotalUserContributions(router);
  getTotalUserExpenses(router);
  baseRouter.use('/cumulatives', router);
};
