import express from 'express';
import createContribution from './createContribution';
import getAllContributions from './getAllContributions';
import getContributionById from './getContributionById';


export default (baseRouter: express.Router) => {
  const router = express.Router();
  createContribution(router);
  getAllContributions(router);
  getContributionById(router);


  baseRouter.use('/contributions', router);
};
