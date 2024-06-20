import express from 'express';
import createBallot from './createBallot';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  createBallot(router);
  
  baseRouter.use('/ballots', router);
};
