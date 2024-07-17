import express from 'express';
import createCandidates from './createCandidates';
import getCandidates from './getCandidates';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  createCandidates(router);
  getCandidates(router);
  
  baseRouter.use('/candidates', router);
};