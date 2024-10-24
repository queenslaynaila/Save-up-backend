import express from 'express';
import createExternalSaving from './createExSaving';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  createExternalSaving(router);

  baseRouter.use('/donations', router);
};