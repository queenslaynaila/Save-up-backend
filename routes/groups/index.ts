import Router from '../../router';
import createGroup from './createGroup';
import updateGroup from './updateGroup';
import createGroupInvite from './sendGroupInvite';
import getGroupsByUserId from './getGroupsByUserId';
import getGroupMembers from './getGroupMembers';
import handleGroupExit from './removeGroupMember';
import getGroupActivities from './getGroupActivities';
import createGroupElection from './createGroupElection';
import createGroupElectionCandidates from './createGrpElectionCandidates';
import getGroupElectionList from './getGroupElectionList';
import updateGroupElections from './updateElection';
import getGroupElectionResults from './getGroupElectionResults';
import ratifyElection from './ratifyElection';
import createBallot from './createBallot';

const router = Router.getRouterInstance('/groups', 'Groups');

createGroup(router);
updateGroup(router);
getGroupsByUserId(router);
getGroupMembers(router);
handleGroupExit(router);
createGroupInvite(router);
getGroupActivities(router);
createGroupElection(router);
createGroupElectionCandidates(router);
getGroupElectionList(router);
updateGroupElections(router);
createBallot(router);
getGroupElectionResults(router);
ratifyElection(router);

export default router;
