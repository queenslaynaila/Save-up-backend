import Router from '../../router';
import createGroup from './createGroups';
import UpdateGroup from './updateGroup';
import getUserGroups from './getGroups';
import getGroupMembers from './getGroupMembers';
import manageGroupMembership from './leaveGroup';
import getGroupActivities from './getActivity';

const router = Router.getRouterInstance('/groups', 'Groups');

createGroup(router);
UpdateGroup(router);
getUserGroups(router);
getGroupMembers(router);
getGroupActivities(router);
manageGroupMembership(router);

export default router;