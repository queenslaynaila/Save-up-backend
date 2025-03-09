import Router from '../../router';
import updateIdDetails from './updateIdentification';
import getUsersBySearchCriteria from './getUserByCriteria';
import updateUserRole from './updateUserRole';
import updateUserPin from './updateUserPin';
import updateInvites from './updateInvitation';
import getInvites from './getUserGroupInvitations';

const router = Router.getRouterInstance('/users', 'Users');

getUsersBySearchCriteria(router);
updateUserPin(router);
updateInvites(router);
updateIdDetails(router);
updateUserRole(router);
getInvites(router);

export default router;