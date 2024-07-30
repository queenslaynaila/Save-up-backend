import express from 'express';
import createPocket from './createPocket';
import deletePocket from './deletePocket';
import getPocketByCriteria from './getPocketByCriteria';
import getTransactionsForPocket from './getTransactionsForPocket';
import updatePocket from './updatePocket';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  createPocket(router);
  deletePocket(router);
  getPocketByCriteria(router);
  getTransactionsForPocket(router);
  updatePocket(router);

  baseRouter.use('/pockets', router);
};