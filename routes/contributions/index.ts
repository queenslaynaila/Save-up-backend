import express from 'express';
//import createContribution from './createContribution';
//import getContributionsByConditions from './getContributionsByConditions';
//import getContributionById from './getContributionById';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  //createContribution(router);
  //getContributionsByConditions(router);
  //getContributionById(router);

  baseRouter.use('/contributions', router);
};
