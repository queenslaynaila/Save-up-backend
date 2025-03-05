import Router from '../../router';
import login from './login';
import logout from './logout';
import register from './register';
import initiatePinReset from './initiatePinReset';
import verifyPinResetToken from './verifyPinResetToken';
import  verifySecurityAnswers from './verifySecurityAnswers';
import resetPin from './resetPin';

const router = Router.getRouterInstance('/auth', 'Auth');

register(router);
login(router);
logout(router);
initiatePinReset(router);
verifyPinResetToken(router);
verifySecurityAnswers(router);
resetPin(router);

export default router;