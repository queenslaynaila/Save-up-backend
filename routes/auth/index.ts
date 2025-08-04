import Router from '../../core/router';
import login from './login';
import logout from './logout';
import createUser from './register';
import initiatePinReset from './initiatePinReset';
import verifyPinResetToken from './verifyPinResetToken';
import verifySecurityAnswers from './verifySecurityAnswers';
import resetPin from './resetPin';
import getRefreshToken from './refreshToken';

const router = Router.createResourceRouter('Auth');

createUser(router);
login(router);
createUser(router);
getRefreshToken(router);
logout(router);
initiatePinReset(router);
verifyPinResetToken(router);
verifySecurityAnswers(router);
resetPin(router);

export default router;