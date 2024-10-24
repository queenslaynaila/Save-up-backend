import express from 'express';
import createNextOfKin from './createNextOfKin';
import getNextOfKin from './getNextOfKin';
import deleteNextOfKin from './deleteNextOfKin';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  createNextOfKin(router);
  getNextOfKin(router);
  deleteNextOfKin(router);

  baseRouter.use('/next-of-kin', router);
};