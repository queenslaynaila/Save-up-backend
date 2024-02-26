import express from 'express';
import createSaving from './createSaving';
// import deleteSaving from './deleteSaving';
import getAllSavings from './getAllSavings';
import getSavingsByUserID from './getSavingsByUserID';
import getSavingBySavingID from './getSavingBySavingID';
// import updateSaving from './updateSaving';

export interface savingInterface {
  id: string;
  user_id: string;
  description: string;
  category_id: string;
  priority: string;
  status: string;
  target_amount: number;
  target_date: string;
  start_date: Date;
  created_at: Date;
  updated_at: Date;
}

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createSaving(router);
  // deleteSaving(router);
  getAllSavings(router);
  getSavingsByUserID(router);
  //updateSaving(router);
  getSavingBySavingID(router);

  baseRouter.use('/savings', router);
};
