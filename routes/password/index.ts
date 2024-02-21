import express from 'express';
import initiatePasswordReset from './initiatePasswordReset';
import resetPassword from './resetPassword';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  initiatePasswordReset(router);
  resetPassword(router);

  baseRouter.use('/password', router);
};
