import express from 'express';
import createGroup from './createGroups';
import UpdateGroup from './updateGroup';
import getUserGroups from './getUserGroups';
import getGroupMembers from './getGroupMembers';
import getCommonGroups from './getCommonGroups';
import approveWithdrawal from './approveWithdrawal';
import leaveGroup from './leaveGroup';
import removeMember from './removeMember';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  createGroup(router);
  getUserGroups(router);
  getGroupMembers(router);
  UpdateGroup(router);
  getCommonGroups(router);
  approveWithdrawal(router);
  leaveGroup(router);
  removeMember(router);

  baseRouter.use('/groups', router);
};