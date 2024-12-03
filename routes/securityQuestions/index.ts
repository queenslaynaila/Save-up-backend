import getAllSecurityQuestions from './getAllSecurityQuestions';
// import createSecurityAnswer from './createSecurityAnswer';
// import updateSecurityAnswer from './updateAnswer';
import Router from '../../m';

const router = Router.getRouterInstance('/security-questions', 'Security');

getAllSecurityQuestions(router);
// createSecurityAnswer(router);
// updateSecurityAnswer(router);

export default router;