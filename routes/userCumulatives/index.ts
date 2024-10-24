import express from 'express';
import getTotalUserExpenditure from './getTotalUserExpenditure';
import getTopExpenseCategories from './getTopExpenseCategories';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  getTotalUserExpenditure(router);
  getTopExpenseCategories(router);

  baseRouter.use('/cumulatives', router);
};