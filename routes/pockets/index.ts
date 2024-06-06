import express from 'express';
import createPocket from './createPocket';
import deletePocket from './deletePocket';
import getPocketByCriteria from './getPocketByCriteria';
import updatePocket from './updatePocket';
import getPocketByPktID from './getPocketByPktID';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  createPocket(router);
  deletePocket(router);
  getPocketByCriteria(router);
  updatePocket(router);
  getPocketByPktID(router);

  baseRouter.use('/pockets', router);
};
