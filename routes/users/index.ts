import Router from '../../router';
import getUsersBySearchCriteria from './getUserByCriteria';
import updateUserRole from './updateUserRole';
import updateUserPin from './updateUserPin';
import updateInvites from './updateInvitation';
import getInvites from './getUserGroupInvitations';
import getGroupsByUserId from './getGroupsByUserId';
import unlockUserAccount from './unlockUserAccount';
import updateIdDetails from './updateIdentification';
import updateUserStatus from './updateUserStatus';

const router = Router.getRouterInstance('/users', 'Users');

getUsersBySearchCriteria(router);
updateUserPin(router);
updateIdDetails(router);
updateUserRole(router);
getInvites(router);
updateInvites(router);
getGroupsByUserId(router);
unlockUserAccount(router);
updateUserStatus(router);

export default router;