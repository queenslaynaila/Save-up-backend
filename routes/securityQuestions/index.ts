import getAllSecurityQuestions from './getAllSecurityQuestions';
import createSecurityAnswer from './createSecurityAnswer';
import Router from '../../router';

const router = Router.getRouterInstance('/security-questions', 'Security Questions');

getAllSecurityQuestions(router);
createSecurityAnswer(router);

export default router;