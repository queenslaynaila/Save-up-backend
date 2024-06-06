import express from 'express';
import proposeGroupAdmins from './proposeGroupAdmins';
import getProposedGroupAdmins from './getProposedGroupAdmins';
import approveProposedGroupAdmin from './approveProposedGroupAdmin';
import makeGroupAdmin from './makeGroupAdmin';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  proposeGroupAdmins(router);
  getProposedGroupAdmins(router)
  approveProposedGroupAdmin(router);
  makeGroupAdmin(router);

  baseRouter.use('/group-admins', router);
};