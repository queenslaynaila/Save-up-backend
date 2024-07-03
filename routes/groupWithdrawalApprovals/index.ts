import { Router } from 'express';
import approveWithdrawal from './approveWithdrawal';

export default (baseRouter: Router) => {
  const router = Router();

  approveWithdrawal(router);
  
  baseRouter.use('/group-withdrawal-approvals', router);
};