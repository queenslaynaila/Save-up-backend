import { Router } from 'express';
import createWithdrawal from './createWithdrawal';

export default (baseRouter: Router) => {
  const router = Router();

  createWithdrawal(router);
  
  baseRouter.use('/withdrawals', router);
};

