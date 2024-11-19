import Router from '../../router';
import updatePin from './updatePin';
import initiatePinReset from './initiatePinReset';
import verifyPinResetToken from './verifyPinResetToken';
import verifySecurityAnswers from './verifySecurityAnswers';
import resetPin from './resetPin';

const router = Router.getRouterInstance('/pin-reset', 'Pin Reset');

updatePin(router);
initiatePinReset(router);
verifyPinResetToken(router);
verifySecurityAnswers(router);
resetPin(router);

export default router;
