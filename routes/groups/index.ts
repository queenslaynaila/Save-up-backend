import Router from '../../router';
import createGroup from './createGroups';
import UpdateGroup from './updateGroup';
import getUserGroups from './getGroups';
import getGroupMembers from './getGroupMembers';
import manageGroupMembership from './leaveGroup';

const router = Router.getRouterInstance('/groups', 'Groups');

createGroup(router);
UpdateGroup(router);
getUserGroups(router);
getGroupMembers(router);
manageGroupMembership(router);

export default router;