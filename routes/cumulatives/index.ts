import express from 'express';
import getTotalUserTargetSavings from './getTotalUserTargetSavings';
import getTotalUserContributions from './getTotalUserContributions';
export default (baseRouter: express.Router) => {
  const router = express.Router();
  getTotalUserTargetSavings(router);
  getTotalUserContributions(router);
  baseRouter.use('/cumulatives', router);
};
