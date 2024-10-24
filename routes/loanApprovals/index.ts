import express from 'express';
import approveLoan from './createApproval';
import getUnapprovedLoans from './getUnnaprovedLoans';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  approveLoan(router);
  getUnapprovedLoans(router);

  baseRouter.use('/approved-loans', router);
};