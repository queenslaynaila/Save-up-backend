import express from 'express';
import callElections from './callElections';
import createCandidates from './createCandidates';
import vote from './vote';
import calculateElectionWinner from './calculateElectionWinner';

export default (baseRouter: express.Router) => {

  const router = express.Router();
  callElections(router);
  createCandidates(router);
  calculateElectionWinner(router);
  vote(router);

  baseRouter.use('/elections', router);
};
