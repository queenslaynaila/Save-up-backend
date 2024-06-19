import { Router } from 'express';
import createRatification from './createRatification';

export default (baseRouter: Router) => {
  const router = Router();

  createRatification(router)
  
  baseRouter.use('/ratification', router);
};

