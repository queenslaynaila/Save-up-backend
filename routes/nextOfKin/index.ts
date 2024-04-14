import express from 'express';
import createKin from './createKin';
import getKin from './getKin';
import updateKin from './updateKin';
import deleteKin from './deleteKin';


export default (baseRouter: express.Router) => {
  const router = express.Router();
  createKin(router);
  getKin(router);
  updateKin(router);
  deleteKin(router);
  baseRouter.use('/next-of-kin', router);
};
