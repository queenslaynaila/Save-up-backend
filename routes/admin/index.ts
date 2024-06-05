import { Router } from 'express';
import getFinancialStats from './getFinancialStats';

export default (baseRouter: Router) => {
  const router = Router();

  getFinancialStats(router);

  baseRouter.use('/stats', router);
};