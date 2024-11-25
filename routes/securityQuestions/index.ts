import getAllSecurityQuestions from './getAllSecurityQuestions';
// import getUsersQuestions from './getUsersQuestions';
import Router from '../../router';

const router = Router.getRouterInstance('/security-questions', 'Security Questions');

getAllSecurityQuestions(router);
// getUsersQuestions(router);

export default router;