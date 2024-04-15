import express from 'express';
import updatePassword from './updatePassword';
import initiatePasswordReset from './initiatePasswordReset';
import verifyPasswordResetToken from './verifyPasswordResetToken';
import verifySecurityAnswers from './verifySecurityAnswers';
import resetPassword from './resetPassword';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  updatePassword(router);
  initiatePasswordReset(router);
  verifyPasswordResetToken(router);
  verifySecurityAnswers(router);
  resetPassword(router);

  baseRouter.use('/pin', router);
};
