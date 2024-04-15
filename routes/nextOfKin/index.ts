import express from 'express';
import createNextOfKin from './createNextOfKin';
import getNextOfKin from './getNextOfKin';
import updateNextOfKin from './updateNextOfKin';
import deleteNextOfKin from './deleteNextOfKin';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  createNextOfKin(router);
  getNextOfKin(router);
  updateNextOfKin(router);
  deleteNextOfKin(router);
  
  baseRouter.use('/next-of-kin', router);
};
