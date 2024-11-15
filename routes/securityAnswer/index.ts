import Router from '../../router';
import createSecurityAnswer from './createSecurityAnswer';
import updateSecurityAnswer from './updateAnswer';

const router = Router.getInstance('/security-answers', 'Security Answers');

createSecurityAnswer(router);
updateSecurityAnswer(router);

export default router;