import getAllSecurityQuestions from './getAllSecurityQuestions';
import Router from '../../router';

const router = Router.getRouterInstance('/security-questions', 'Security Questions');

getAllSecurityQuestions(router);

export default router;