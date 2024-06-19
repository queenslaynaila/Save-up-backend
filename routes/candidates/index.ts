import express from 'express';
import createCandidates from './createCandidates';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  createCandidates(router);
  
  baseRouter.use('/candidates', router);
};
