import Router from '../../router';
import updateUserAttributes from './updateAttributes';
import getUsersBySearchCriteria from './getUserByCriteria';

const router = Router.getRouterInstance('/users', 'Users');

getUsersBySearchCriteria(router);
updateUserAttributes(router);

export default router;