import express from 'express';
import getTotalUserDeposits from './getTotalUserDeposits';
import getTotalUserExpenditure from './getTotalUserExpenditure';
import getTopExpenseCategories from './getTopExpenseCategories';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  getTotalUserDeposits(router);
  getTotalUserExpenditure(router);
  getTopExpenseCategories(router);

  baseRouter.use('/cumulatives', router);
};