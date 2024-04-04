import express from 'express';
import createKin from './createKin';
import deleteKin from './deleteKin';
import updateKin from './updateKin';

export default (baseRouter: express.Router) => {

  const router = express.Router();
  
  createKin(router);
  deleteKin(router);
  updateKin(router);

  baseRouter.use('/next-of-kin', router);
};
