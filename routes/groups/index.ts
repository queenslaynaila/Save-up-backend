import Router from '../../router';
import createGroup from './createGroup';
import updateGroup from './updateGroup';
import createGroupInvite from './sendGroupInvite';
import getGroupsByUserId from './getGroupsByUserId';
import getGroupMembers from './getGroupMembers';
import handleGroupExit from './removeGroupMember';
import getGroupActivities from './getGroupActivities';

const router = Router.getRouterInstance('/groups', 'Groups');

createGroup(router);
updateGroup(router);
getGroupsByUserId(router);
getGroupMembers(router);
handleGroupExit(router);
createGroupInvite(router);
getGroupActivities(router);

export default router;