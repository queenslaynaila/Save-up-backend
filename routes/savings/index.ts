import express from 'express';
import createSaving from './createSaving';
import getSavingsByConditions from './getSavingsByConditions';
import getSavingById from './getSavingById';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createSaving(router);
  getSavingsByConditions(router);
  getSavingById(router);

  baseRouter.use('/savings', router);
};