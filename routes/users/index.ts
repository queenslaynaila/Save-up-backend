import Router from '../../router';
import createUser from './createUser';
import login from './login';
import updateUserAttributes from './updateAttributes';
import getUserBySearchCriteria from './getUserByCriteria';
import getTransactionsForUser from './getTransactionsForUser';
import logout from './logout';

const router = Router.getRouterInstance('/users', 'Users');

createUser(router);
login(router);
getUserBySearchCriteria(router);
getTransactionsForUser(router);
updateUserAttributes(router);
logout(router);

export default router;