import createUser from './createUser';
import login from './login';
import getUserBySearchCriteria from './getUserByCriteria';
import updateUserAttributes from './updateAttributes';
import logout from './logout';
import Router from '../../router';

const router = Router.getRouterInstance('/users', 'Users');

createUser(router);
login(router);
getUserBySearchCriteria(router);
updateUserAttributes(router);
logout(router);

export default router;