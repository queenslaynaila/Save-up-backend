import express from 'express';
import createSaving from './createSaving';
import getSavingsByCriteria from './getSavingsByCriteria';
import totalSavings from './totalSavings';
import availableSavings from './availableSavings';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  createSaving(router);
  getSavingsByCriteria(router);
  totalSavings(router);
  availableSavings(router);

  baseRouter.use('/savings', router);
};