import express from 'express';
import updatePassword from './updatePassword';
import { initiatePasswordReset,verifyPasswordResetToken,verifySecurityAnswers,resetPassword } from './ForgetPasswordRoutes';

export default (baseRouter: express.Router) => {
  const router = express.Router();


  updatePassword(router);
  initiatePasswordReset(router);
  verifyPasswordResetToken(router);
  verifySecurityAnswers(router);
  resetPassword(router);

  baseRouter.use('/password', router);
};
