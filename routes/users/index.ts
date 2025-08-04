import Router from '../../core/router';
import getUsersBySearchCriteria from './getUserByCriteria';
import updateUserRole from './updateUserRole';
import updateUserPin from './updateUserPin';
import updateInvites from './updateInvitation';
import getInvites from './getUserGroupInvitations';
import getGroupsByUserId from './getGroupsByUserId';
import unlockUserAccount from './unlockUserAccount';
import updateIdDetails from './updateIdentification';
import updateUserStatus from './updateUserStatus';
import getModerators from './getModerators';
import getGroupActivities from './getUserActivities';
import { get } from 'http';

const router = Router.createResourceRouter('Users');

getModerators(router);
getUsersBySearchCriteria(router);
getInvites(router);
getGroupsByUserId(router);
getGroupActivities(router); 
updateUserPin(router);
updateIdDetails(router);
updateUserRole(router);
updateInvites(router);
unlockUserAccount(router);
updateUserStatus(router);

export default router;