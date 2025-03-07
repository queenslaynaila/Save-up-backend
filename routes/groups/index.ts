import Router from '../../router';
import createGroup from './createGroups';
import UpdateGroup from './updateGroup';
import getUserGroups from './getGroups';
import getGroupMembers from './getGroupMembers';
import manageGroupMembership from './leaveGroup';
import getGroupActivities from './getActivity';
import createInvite from './createInvite';

const router = Router.getRouterInstance('/groups', 'Groups');

createGroup(router);
UpdateGroup(router);
getUserGroups(router);
getGroupMembers(router);
getGroupActivities(router);
manageGroupMembership(router);
createInvite(router);

export default router;