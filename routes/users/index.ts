import Router from '../../router';
import updateUserAttributes from './updateAttributes';
import getUsersBySearchCriteria from './getUserByCriteria';
import getUsersByUserId from './getUserById';
import updateUserRole from './updateUserRole';
import updateUserPin from './updateUserPin';

const router = Router.getRouterInstance('/users', 'Users');

getUsersBySearchCriteria(router);
getUsersByUserId(router);
updateUserPin(router);
updateUserAttributes(router);
updateUserRole(router);

export default router;