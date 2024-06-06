import express from 'express';
import approveProposedGroupAdmin from './approveProposedGroupAdmin';
import makeGroupAdmin from './makeGroupAdmin';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  approveProposedGroupAdmin(router);
  makeGroupAdmin(router);

  baseRouter.use('/group-admins', router);
};