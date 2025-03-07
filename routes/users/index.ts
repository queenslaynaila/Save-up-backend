import Router from '../../router';
import updateIdDetails from './updateIdentification';
import getUsersBySearchCriteria from './getUserByCriteria';
import getUsersByUserId from './getUserById';
import updateUserRole from './updateUserRole';
import updateUserPin from './updateUserPin';
import updateInvites from './updateInvitation';

const router = Router.getRouterInstance('/users', 'Users');

getUsersBySearchCriteria(router);
getUsersByUserId(router);
updateUserPin(router);
updateIdDetails(router);
updateUserRole(router);
updateInvites(router);

export default router;