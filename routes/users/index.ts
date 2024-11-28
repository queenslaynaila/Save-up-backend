import Router from '../../router';
import updateUserAttributes from './updateAttributes';
import getUserBySearchCriteria from './getUserByCriteria';
import getTransactionsForUser from './getTransactionsForUser';

const router = Router.getRouterInstance('/users', 'Users');

getUserBySearchCriteria(router);
getTransactionsForUser(router);
updateUserAttributes(router);

export default router;