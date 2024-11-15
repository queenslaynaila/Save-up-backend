import getAllSecurityQuestions from './getAllSecurityQuestions';
import getUsersQuestions from './getUsersQuestions';
import Router from '../../router';

const router = Router.getInstance('/security-questions', 'Security Questions');

getAllSecurityQuestions(router);
getUsersQuestions(router);

export default router;