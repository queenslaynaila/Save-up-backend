import express from 'express';
import proposeGroupAdmins from './proposeGroupAdmins';
import getProposedGroupAdmins from './getProposedGroupAdmins';
import approveProposedGroupAdmin from './approveProposedGroupAdmin';
import computeAdminApprovalResults from './computeAdminApprovalResults'
import makeGroupAdmin from './makeGroupAdmin';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  proposeGroupAdmins(router);
  getProposedGroupAdmins(router)
  approveProposedGroupAdmin(router);
  computeAdminApprovalResults(router)
  makeGroupAdmin(router);

  baseRouter.use('/group-admin', router);
};