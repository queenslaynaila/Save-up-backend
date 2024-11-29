import Router from '../../router';
import updateSecurityAnswer from './updateAnswer';

const router = Router.getRouterInstance('/security-answers', 'Security Answers');

updateSecurityAnswer(router);

export default router;