import { Router } from 'express';
import createAdmin from './createAdmin';
import getTableAgregates from './getTableAgregates';
import getCompletedSavings from './getCompletedSavings';

export default (baseRouter: Router) => {
  const router = Router();
  createAdmin(router);
  getTableAgregates(router);
  getCompletedSavings(router);

  baseRouter.use('/admin', router);
};
