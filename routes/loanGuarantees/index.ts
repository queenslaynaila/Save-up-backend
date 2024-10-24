import express from 'express';
import guaranteeLoan from './guaranteeLoan';
import getGuarantorRequests from './getGuarantorRequests';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  guaranteeLoan(router);
  getGuarantorRequests(router);

  baseRouter.use('/guarantors', router);
};