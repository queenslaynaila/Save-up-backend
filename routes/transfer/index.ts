import { Router } from 'express';
import createTransfer from './createTransfer';

export default (baseRouter: Router) => {
  const router = Router();

  createTransfer(router)
  
  baseRouter.use('/transfers', router);
};

