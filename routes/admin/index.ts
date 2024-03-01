import { Router } from 'express';
import createAdmin from './createAdmin';
import cumulatives from './cumulatives';

export default (baseRouter: Router) => {
  const router = Router();
  createAdmin(router);
  cumulatives(router);

  baseRouter.use('/admin', router);
};
