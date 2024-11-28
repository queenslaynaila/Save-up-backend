import Router from '../../router';
import login from './login';
import logout from './logout';
import register from './register';

const router = Router.getRouterInstance('/auth', 'Auth');

register(router);
login(router);
logout(router);

export default router;