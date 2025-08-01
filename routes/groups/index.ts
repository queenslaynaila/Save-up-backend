import Router from '../../core/router';
import createGroup from './createGroup';
import updateGroup from './updateGroup';
import createGroupInvite from './sendGroupInvite';
import getGroupMembers from './getGroupMembers';
import handleGroupExit from './removeGroupMember';
import getGroupActivities from './getGroupActivities';

const router = Router.createResourceRouter('Groups');

createGroup(router);
updateGroup(router);
getGroupMembers(router);
handleGroupExit(router);
createGroupInvite(router);
getGroupActivities(router);

export default router;