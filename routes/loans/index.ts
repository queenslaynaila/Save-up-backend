import { Router } from 'express';
import createLoanRequest from './createLoanRequest';

export default (baseRouter: Router) => {
  const router = Router();

  createLoanRequest(router);

  baseRouter.use('/request-loan', router);
};