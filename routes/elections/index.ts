import Router from '../../router';
import createElections from './createElections';
import createCandidates from './createCandidates';
import updateElections from './updateElection';
import getElections from './getElections';
import getCandidates from './getElectionCandidates';
import  createBallot from './createBallot';
import viewResults from './results';
import ratifyElection from './ratifyElection';

const router = Router.getRouterInstance('/elections', 'Elections');


createElections(router);
getElections(router);
updateElections(router);
createCandidates(router);
getCandidates(router);
createBallot(router);
viewResults(router);
ratifyElection(router);

export default router;