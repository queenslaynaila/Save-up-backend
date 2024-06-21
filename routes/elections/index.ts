import { Router } from 'express';
import createElections from './createElections';

export default (baseRouter: Router) => {
  const router = Router();

  createElections(router);
  
  baseRouter.use('/elections', router)
};
