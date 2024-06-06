import express from 'express';
import updatePin from './updatePin';
import initiatePinReset from './initiatePinReset';
import verifyPinResetToken from './verifyPinResetToken';
import verifySecurityAnswers from './verifySecurityAnswers';
import resetPin from './resetPin';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  updatePin(router);
  initiatePinReset(router);
  verifyPinResetToken(router);
  verifySecurityAnswers(router);
  resetPin(router);

  baseRouter.use('/pin-reset', router);
};
