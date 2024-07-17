import express from 'express';
import createGroupDeposit from './createGroupDeposit';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  createGroupDeposit(router);
  
  baseRouter.use('/group-deposits', router);
};