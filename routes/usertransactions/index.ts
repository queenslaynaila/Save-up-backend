import { Router } from 'express';
import getTransactions from './getTransactions';

export default (baseRouter: Router) => {
  const router = Router();

  getTransactions(router)
  
  baseRouter.use('/user-transactions', router);
};