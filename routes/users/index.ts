import Router from '../../router';
import updateUserAttributes from './updateAttributes';
import getUsersBySearchCriteria from './getUserByCriteria';
import getTransactionsForUser from './getTransactionsForUser';

const router = Router.getRouterInstance('/users', 'Users');

getUsersBySearchCriteria(router);
getTransactionsForUser(router);
updateUserAttributes(router);

export default router;