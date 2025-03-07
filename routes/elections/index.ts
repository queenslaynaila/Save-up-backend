import Router from '../../router';
import createGroupElection from './createGroupElection';
import createCandidates from './createCandidates';
import updateElections from './updateElection';
import getGroupElectionList from './getGroupElectionList';
import getCandidates from './getElectionCandidates';
import  createBallot from './createBallot';
import viewResults from './results';
import ratifyElection from './ratifyElection';

const router = Router.getRouterInstance('/elections', 'Elections');


createGroupElection(router);
getGroupElectionList(router);
updateElections(router);
createCandidates(router);
getCandidates(router);
createBallot(router);
viewResults(router);
ratifyElection(router);

export default router;