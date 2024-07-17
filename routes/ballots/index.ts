import express from 'express';
import createBallot from './createBallot';
import getBallots from './computeBallot';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  createBallot(router);
  getBallots(router);
  
  baseRouter.use('/ballots', router);
};