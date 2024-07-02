import { Router } from 'express';
import createElections from './createElections';
import getElections from './getElections';

export default (baseRouter: Router) => {
  const router = Router();

  createElections(router);
  getElections(router);
  
  baseRouter.use('/elections', router)
};
