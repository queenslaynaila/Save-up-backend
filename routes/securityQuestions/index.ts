import getAllSecurityQuestions from './getAllSecurityQuestions';
import createSecurityAnswer from './createSecurityAnswer';
import Router from '../../new/router';

const router = Router.createResourceRouter('Security Questions');

getAllSecurityQuestions(router);
createSecurityAnswer(router);

export default router;