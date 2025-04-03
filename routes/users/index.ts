import Router from '../../router';
import updateIdDetails from './updateIdentification';
import getUsersBySearchCriteria from './getUserByCriteria';
import updateUserRole from './updateUserRole';
import updateUserPin from './updateUserPin';
import updateInvites from './updateInvitation';
import getNextOfKin from '../users/getNextOfKin';
import getInvites from './getUserGroupInvitations';
import getGroupsByUserId from './getGroupsByUserId';

const router = Router.getRouterInstance('/users', 'Users');

getUsersBySearchCriteria(router);
updateUserPin(router);
updateIdDetails(router);
updateUserRole(router);
getNextOfKin(router);
getInvites(router);
updateInvites(router);
getGroupsByUserId(router)

export default router;