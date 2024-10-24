import { Router } from 'express';
import createLoanRequest from './createLoanRequest';
import getLoans from './getReviewedLoans';

export default (baseRouter: Router) => {
  const router = Router();

  createLoanRequest(router);
  getLoans(router);

  baseRouter.use('/loans', router);
};