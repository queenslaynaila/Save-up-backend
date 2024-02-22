import express from 'express';
import createSaving from './createSaving';
import deleteSaving from './deleteSaving';
import getAllSavings from './getAllSavings';
import getSavingsByUserID from './getSavingsByUserID';
import getSavingBySavingID from './getSavingBySavingID';
import updateSaving from './updateSaving';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createSaving(router);
  deleteSaving(router);
  getAllSavings(router);
  getSavingsByUserID(router);
  updateSaving(router);
  getSavingBySavingID(router);

  baseRouter.use('/savings', router);
};
