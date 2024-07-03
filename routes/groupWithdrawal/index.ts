import { Router } from 'express';
import createWithdrawal from './createGroupWithdrawal';

export default (baseRouter: Router) => {
  const router = Router();

  createWithdrawal(router);
  
  baseRouter.use('/group-withdrawals', router);
};