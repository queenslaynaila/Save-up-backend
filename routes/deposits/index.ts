import express from 'express';
import createDeposit from './createDeposit';
import getDepositsByCriteria from './getDepositsByCriteria';
import getDepositByDepositId from './getDepositByDepositId';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  createDeposit(router);
  getDepositsByCriteria(router);
  getDepositByDepositId(router);

  baseRouter.use('/deposits', router);
};