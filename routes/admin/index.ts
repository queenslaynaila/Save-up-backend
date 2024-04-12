import { Router } from 'express';
import createAdmin from './createAdmin';
import getTableStats from './getTableStats';
import updateUserRole from './updateUserRole';
export default (baseRouter: Router) => {
  const router = Router();
  createAdmin(router);
  getTableStats(router);
  updateUserRole(router);

  baseRouter.use('/admin', router);
};