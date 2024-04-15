import { Router } from 'express';
import createAdmin from './createAdmin';
import getFinancialStats from './getFinancialStats';
import updateUserRole from './updateUserRole';

export default (baseRouter: Router) => {
  const router = Router();

  createAdmin(router);
  getFinancialStats(router);
  updateUserRole(router);

  baseRouter.use('/admin', router);
};