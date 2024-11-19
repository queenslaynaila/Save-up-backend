import Router from '../../router';
import createSecurityAnswer from './createSecurityAnswer';
import updateSecurityAnswer from './updateAnswer';

const router = Router.getRouterInstance('/security-answers', 'Security Answers');

createSecurityAnswer(router);
updateSecurityAnswer(router);

export default router;