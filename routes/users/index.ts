import createUser from './createUser';
import login from './login';
import getUserByCriteria from './getUserByCriteria';
import updateUserAttributes from './updateAttributes';
import updateUserRole from './updateUserRole';
import logout from './logout';
import Router from '../../router';

const router = Router.getRouterInstance('/users', 'Users');

createUser(router);
login(router);
getUserByCriteria(router);
updateUserRole(router);
updateUserAttributes(router);
logout(router);

export default router;