import express from 'express';
import getTotalUserTargetGoals from './getTotalUserTargetGoals';
import getTotalUserSavings from './getTotalUserSavings';
import getTotalUserExpenditure from './getTotalUserExpenditure';
import getTopExpenseCategories from './getTopExpenseCategories';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  getTotalUserTargetGoals(router);
  getTotalUserSavings(router);
  getTotalUserExpenditure(router);
  getTopExpenseCategories(router);

  baseRouter.use('/cumulatives', router);
};