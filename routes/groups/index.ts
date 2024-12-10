import Router from '../../router';
import createGroup from './createGroups';
import UpdateGroup from './updateGroup';
import getUserGroups from './getUserGroups';
import getGroupMembers from './getGroupMembers';
// import approveWithdrawal from './approveWithdrawal';
import manageGroupMembership from './leaveGroup';

const router = Router.getRouterInstance('/groups', 'Groups');

createGroup(router);
getUserGroups(router);
getGroupMembers(router);
UpdateGroup(router);
// approveWithdrawal(router);
manageGroupMembership(router);

export default router;