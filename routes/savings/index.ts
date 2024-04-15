import express from 'express';
import createSaving from './createSaving';
import getSavingsByCriteria from './getSavingsByCriteria';
import getSavingBySavingId from './getSavingBySavingId';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  createSaving(router);
  getSavingsByCriteria(router);
  getSavingBySavingId(router);

  baseRouter.use('/savings', router);
};