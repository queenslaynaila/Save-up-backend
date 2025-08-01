import createGroupElection from './createGroupElection';
import createGroupElectionCandidates from './createGrpElectionCandidates';
import getGroupElectionList from './getGroupElectionList';
import getGroupElectionResults from './getGroupElectionResults';
import getElectionCandidates from './getElectionCandidates';
import updateGroupElections from './updateElection';
import ratifyElection from './ratifyElection';
import createBallot from './createBallot';
import Router from '../../new/router';

const router = Router.createResourceRouter('Elections');

createGroupElection(router);
createGroupElectionCandidates(router);
getElectionCandidates(router);
getGroupElectionList(router);
updateGroupElections(router);
getGroupElectionResults(router);
ratifyElection(router);
createBallot(router);

export default router;