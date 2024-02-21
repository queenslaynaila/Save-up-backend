import express from 'express';
import createSaving from './createSaving';
import deleteSaving from './deleteSaving';
import getAllSavings from './getAllSavings';
import getFilteredSavings from './getFilteredSavings';
import getSavingById from './getSavingById';
import updateSaving from './updateSaving';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createSaving(router);
  deleteSaving(router);
  getAllSavings(router);
  getFilteredSavings(router);
  getSavingById(router);
  updateSaving(router);

  baseRouter.use('/savings', router);
};
